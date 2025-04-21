using System.Net.WebSockets;
using System.Text;
using MongoDB.Driver;
using SDService.Background;
using SDService.Data;
using SDService.IRepository;
using SDService.IServices;
using SDService.Repository;
using SDService.Services;

var builder = WebApplication.CreateBuilder(args);

// Регистрируем HttpClientFactory
builder.Services.AddHttpClient("ComfyUI", client =>
{
    client.BaseAddress = new Uri("http://localhost:8000");  // Указываем IP другого сервиса
    client.Timeout = TimeSpan.FromSeconds(30);  // Устанавливаем тайм-аут
});

// Регистрируем зависимости
builder.Services.AddControllers();
builder.Services.AddSingleton<WebSocketConnectionManager>();
builder.Services.AddSingleton<MongoSeeder>();
builder.Services.AddScoped<ITemplateProcessingService, TemplateProcessingService>();
builder.Services.AddScoped<IRenderQueueRepository, RenderQueueRepository>();
builder.Services.AddScoped<IRenderTrackingService, RenderTrackingService>();
builder.Services.AddHostedService<RenderTrackingJob>();

// Регистрация MongoDB
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var connectionString = configuration.GetConnectionString("MongoDb");
    return new MongoClient(connectionString);
});

builder.Services.AddScoped<IMongoDatabase>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase("StableDeffusionDB"); // Укажи нужное имя базы данных
});

// Swagger (опционально)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder
                .WithOrigins("http://localhost:3000")  // Замените на ваш фронтенд-адрес
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

// Выполняем сид при старте
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<MongoSeeder>();
    await seeder.SeedAsync();
}

// WebSocket настройки
var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(120)
};
app.UseWebSockets(webSocketOptions);
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/api/public/ws")
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            var manager = context.RequestServices.GetRequiredService<WebSocketConnectionManager>();
            manager.AddSocket(webSocket);

            await EchoLoop(webSocket, manager);
        }
        else
        {
            context.Response.StatusCode = 400;
        }
    }
    else
    {
        await next();
    }
});

app.UseRouting();

// Swagger (опционально)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS редирект (если нужно)
app.UseHttpsRedirection();

// 👇 Регистрируем контроллеры
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

app.Run();

static async Task EchoLoop(WebSocket socket, WebSocketConnectionManager manager)
{
    var buffer = new byte[1024 * 4];

    while (socket.State == WebSocketState.Open)
    {
        var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

        if (result.MessageType == WebSocketMessageType.Text)
        {
            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);

            var tasks = manager.GetAll()
                .Where(s => s.State == WebSocketState.Open)
                .Select(s =>
                {
                    var data = Encoding.UTF8.GetBytes(message);
                    return s.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Text, true, CancellationToken.None);
                });

            await Task.WhenAll(tasks);
        }
        else if (result.MessageType == WebSocketMessageType.Close)
        {
            manager.RemoveSocket(socket);
            await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
        }
    }
}