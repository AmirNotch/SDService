using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using SDService.IServices;

namespace SDService.Controllers;

[ApiController]
[Route("api/comfy")]
public class ComfyUiController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private const string ComfyUiUploadUrl = "http://host.docker.internal:8000/upload/image";
    private readonly ITemplateProcessingService _service;

    public ComfyUiController(IHttpClientFactory httpClientFactory, ITemplateProcessingService service)
    {
        _httpClient = httpClientFactory.CreateClient();
        _service = service;
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadToComfyUI([FromForm] IFormFile file)
    {
        
        Console.WriteLine("http://host.docker.internal:8000/upload/image");
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        using var form = new MultipartFormDataContent();
        await using var stream = file.OpenReadStream();
        var streamContent = new StreamContent(stream);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

        form.Add(streamContent, "image", file.FileName);

        var response = await _httpClient.PostAsync(ComfyUiUploadUrl, form);

        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, $"ComfyUI error: {responseContent}");
        }

        return Ok(new
        {
            message = "Image uploaded to ComfyUI successfully.",
            comfyResponse = responseContent
        });
    }
    
    [HttpPost("process")]
    public async Task<IActionResult> ProcessTemplates([FromQuery] string userImageName, [FromQuery] string gender)
    {
        if (string.IsNullOrEmpty(userImageName) || string.IsNullOrEmpty(gender))
            return BadRequest("Missing required parameters.");

        await _service.ProcessTemplatesAsync(userImageName, gender);
        return Ok("Templates processed successfully.");
    }
    
    [HttpPost("clear-queue")]
    public async Task<IActionResult> ClearRenderQueue()
    {
        await _service.ClearRenderQueueAsync();
        return Ok("Render queue cleared successfully.");
    }
}
