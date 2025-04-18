using MongoDB.Driver;
using SDService.IRepository;
using SDService.Models.MongoCollections;

namespace SDService.Repository;

public class RenderQueueRepository : IRenderQueueRepository
{
    private readonly IMongoDatabase _database;

    public RenderQueueRepository(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDb"));
        _database = client.GetDatabase("StableDeffusionDB"); // Заменить на своё имя БД
    }

    public async Task AddAsync(RenderQueueItem item)
    {
        try
        {
            var collection = _database.GetCollection<RenderQueueItem>("render_queue");
            Console.WriteLine($"Добавляем элемент в очередь: {item.Prompt_Id}, {item.Number}, {item.Status}");
            await collection.InsertOneAsync(item);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при вставке: {ex.Message}");
        }
    }

}