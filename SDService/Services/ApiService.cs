namespace SDService.Services;

public class ApiService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ApiService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    // Метод для получения сообщения от другого сервиса
    public async Task<string> GetMessageFromApiAsync(string endpoint)
    {
        var client = _httpClientFactory.CreateClient();  // Используем клиент из фабрики
        var response = await client.GetAsync(endpoint);

        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadAsStringAsync();  // Получаем сообщение
        }
        else
        {
            throw new Exception("Ошибка при получении данных с внешнего сервиса");
        }
    }
}
