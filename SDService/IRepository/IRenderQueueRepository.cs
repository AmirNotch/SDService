using SDService.Models.MongoCollections;

namespace SDService.IRepository;

public interface IRenderQueueRepository
{
    Task AddAsync(RenderQueueItem item);
    Task ClearQueueAsync(); // добавляем новый метод
}