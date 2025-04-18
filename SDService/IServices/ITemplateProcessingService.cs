namespace SDService.IServices;

public interface ITemplateProcessingService
{
    Task ProcessTemplatesAsync(string userImageName, string gender);
}