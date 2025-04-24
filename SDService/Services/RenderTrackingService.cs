using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using MongoDB.Driver;
using SDService.AWSServices;
using SDService.IServices;
using SDService.Models.MongoCollections;

namespace SDService.Services;

public class RenderTrackingService : IRenderTrackingService
{
    private readonly IMongoCollection<RenderQueueItem> _renderQueueCollection;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<RenderTrackingService> _logger;
    private readonly ConcurrentDictionary<Guid, WebSocket> _activeSockets = new();
    private readonly WebSocketConnectionManager _connectionManager;
    
    public RenderTrackingService(
        IMongoDatabase mongoDatabase,
        IHttpClientFactory httpClientFactory,
        ILogger<RenderTrackingService> logger,
        WebSocketConnectionManager connectionManager)
    {
        _renderQueueCollection = mongoDatabase.GetCollection<RenderQueueItem>("render_queue");
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _connectionManager = connectionManager;
    }

    public async Task ProcessPendingRenderJobsAsync(CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient("ComfyUI");

        try
        {
            // Получаем первый объект с status == "pending"
            var pendingJob = await _renderQueueCollection
                .Find(job => job.Status == "Pending")
                .FirstOrDefaultAsync(cancellationToken);  // Только первый объект

            if (pendingJob == null)
            {
                _logger.LogInformation("No pending render jobs found in MongoDB.");
                return;
            }

            _logger.LogInformation("Processing render result for prompt_id: {promptId}", pendingJob.Prompt_Id);

            var historyResponse = await client.GetAsync($"history/{pendingJob.Prompt_Id}", cancellationToken);
            historyResponse.EnsureSuccessStatusCode();
            

            var historyJson = await historyResponse.Content.ReadAsStringAsync(cancellationToken);
            JsonDocument doc = JsonDocument.Parse(historyJson);
            var historyRoot = doc.RootElement;

            // Получаем первый элемент из корня (где ключ — это prompt_id)
            if (historyRoot.ValueKind == JsonValueKind.Object && historyRoot.EnumerateObject().Any())
            {
                var firstPromptEntry = historyRoot.EnumerateObject().First().Value;

                // Пробуем получить "outputs"
                if (firstPromptEntry.TryGetProperty("outputs", out var outputsElement))
                {
                    foreach (var output in outputsElement.EnumerateObject())
                    {
                        if (output.Value.TryGetProperty("images", out var images))
                        {
                            var firstImage = images.EnumerateArray().FirstOrDefault();

                            if (firstImage.ValueKind == JsonValueKind.Object &&
                                firstImage.TryGetProperty("type", out var typeElement) &&
                                typeElement.GetString() == "output" &&
                                firstImage.TryGetProperty("filename", out var filenameElement))
                            {
                                var filename = filenameElement.GetString();
                                _logger.LogInformation("🎉 Found filename from history: {filename}", filename);

                                var imageUrl = $"http://host.docker.internal:8000/view?filename={filename}";
                                var filenameNew = Guid.NewGuid() + filename;
                                try
                                {
                                    var response = await client.GetAsync(imageUrl);
                                    if (response.IsSuccessStatusCode)
                                    {
                                        var imageBytes = await response.Content.ReadAsByteArrayAsync();

                                        var savePath = Path.Combine("DownloadedImages", filenameNew);
                                        Directory.CreateDirectory("DownloadedImages");
                                        await File.WriteAllBytesAsync(savePath, imageBytes);

                                        _logger.LogInformation("✅ Изображение успешно сохранено по пути: {savePath}", savePath);
                                        
                                        // 🔼 Загрузка на S3
                                        using var memoryStream = new MemoryStream(imageBytes);
                                        var s3Uploader = new S3Uploader("AKIAURJWB76W77TSNULG", "CacFkdEG0lkMaMayJd705AHuJ9pB4LwfiELzzGDH", "eu-north-1");

                                        var s3Url = await s3Uploader.UploadFileAsync(memoryStream, filenameNew);
                                        _logger.LogInformation("🌐 Файл загружен на S3 и доступен по ссылке: {url}", s3Url);
                                        
                                        // 🔥 Отправка по WebSocket всем активным клиентам
                                        foreach (var socket in _connectionManager.GetAll())
                                        {
                                            if (socket.State == WebSocketState.Open)
                                            {
                                                try
                                                {
                                                    var messageObject = new
                                                    {
                                                        type = "image",
                                                        url = s3Url,
                                                        filename = filenameNew,
                                                        data = Convert.ToBase64String(imageBytes)
                                                    };

                                                    var json = JsonSerializer.Serialize(messageObject);
                                                    var jsonBytes = Encoding.UTF8.GetBytes(json);

                                                    await socket.SendAsync(
                                                        new ArraySegment<byte>(jsonBytes),
                                                        WebSocketMessageType.Text,
                                                        true,
                                                        CancellationToken.None
                                                    );

                                                    _logger.LogInformation("📦 Структурированный бинарный пакет отправлен по WebSocket.");

                                                    _logger.LogInformation("📤 Изображение отправлено по WebSocket клиенту.");
                                                    
                                                    
                                                    var update = Builders<RenderQueueItem>.Update.Set(r => r.Status, "Successful");

                                                    await _renderQueueCollection.UpdateOneAsync(
                                                        Builders<RenderQueueItem>.Filter.Eq(r => r.Prompt_Id, pendingJob.Prompt_Id),
                                                        update,
                                                        cancellationToken: cancellationToken
                                                    );

                                                    _logger.LogInformation("🟢 Статус задачи обновлён на 'Successful' для prompt_id: {promptId}", pendingJob.Prompt_Id);
                                                }
                                                catch (Exception ex)
                                                {
                                                    _logger.LogError(ex, "❌ Ошибка при отправке изображения по WebSocket");
                                                }
                                            }
                                        }
                                    }
                                    else
                                    {
                                        _logger.LogWarning("⚠️ Не удалось получить изображение. StatusCode: {status}", response.StatusCode);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex, "💥 Ошибка при загрузке и отправке изображения");
                                }
                            }
                        }
                    }
                }
                
                
            }
            
            // TODO: Обновить статус задачи в MongoDB, если нужно
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during render tracking job.");
        }
    }
}