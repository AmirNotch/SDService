using System.Text;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Driver;
using SDService.IRepository;
using SDService.IServices;
using SDService.Models;
using SDService.Models.MongoCollections;

namespace SDService.Services;

public class TemplateProcessingService : ITemplateProcessingService
{
    private readonly IMongoCollection<BsonDocument> _portraits;
    private readonly HttpClient _httpClient;
    private readonly IRenderQueueRepository _renderQueueRepository;

    public TemplateProcessingService(IMongoClient mongoClient, IHttpClientFactory httpClientFactory,
      IRenderQueueRepository renderQueueRepository)
    {
        var database = mongoClient.GetDatabase("StableDeffusionDB");
        _portraits = database.GetCollection<BsonDocument>("portraits");
        _httpClient = httpClientFactory.CreateClient();
        _renderQueueRepository = renderQueueRepository;
    }

    public async Task ProcessTemplatesAsync(string userImageName, string gender)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("Sex", gender);
        var templates = await _portraits.Find(filter).ToListAsync();

        foreach (var template in templates)
        {
            string type = template["TypeOfFunction"].AsString;
            string templateImage = template["Image"].AsString;

            string jsonBody = type switch
            {
                "SwapFace" => GenerateSwapFaceJson(templateImage, userImageName),
                "CropFace" => GenerateCropFaceJson(template, userImageName),
                _ => null
            };

            if (jsonBody == null) continue;

            var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("http://host.docker.internal:8000/prompt", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<PromptResponse>(responseBody, new JsonSerializerOptions
            {
              PropertyNameCaseInsensitive = true
            });

            // сохраняем в MongoDB
            var renderQueueItem = new RenderQueueItem
            {
              Prompt_Id = result.Prompt_Id,
              Number = result.Number,
              Status = "Pending"
            };

            await _renderQueueRepository.AddAsync(renderQueueItem);
        }
    }

    private string GenerateSwapFaceJson(string portraitImage, string userImage)
    {
        return $@"
{{
  ""prompt"": {{
    ""3"": {{
      ""class_type"": ""SaveImage"",
      ""inputs"": {{
        ""images"": [""6"", 0],
        ""filename_prefix"": ""ComfyUI""
      }}
    }},
    ""6"": {{
      ""class_type"": ""ReActorFaceSwap"",
      ""inputs"": {{
        ""input_image"": [""7"", 0],
        ""source_image"": [""8"", 0],
        ""face_model"": ""inswapper_128.onnx"",
        ""face_restore_visibility"": 1,
        ""console_log_level"": 1,
        ""detect_gender_input"": ""no"",
        ""facedetection"": ""retinaface_resnet50"",
        ""source_faces_index"": ""0"",
        ""enabled"": true,
        ""swap_model"": ""inswapper_128.onnx"",
        ""input_faces_index"": ""0"",
        ""face_restore_model"": ""GFPGANv1.3.pth"",
        ""detect_gender_source"": ""no"",
        ""codeformer_weight"": 0.5,
        ""blend_ratio"": 0.5
      }}
    }},
    ""7"": {{
      ""class_type"": ""LoadImage"",
      ""inputs"": {{
        ""image"": ""{portraitImage}""
      }}
    }},
    ""8"": {{
      ""class_type"": ""LoadImage"",
      ""inputs"": {{
        ""image"": ""{userImage}""
      }}
    }}
  }}
}}";
    }

    private string GenerateCropFaceJson(BsonDocument template, string userImage)
    {
        var crop = template["Crop"].AsBsonDocument;
        var left = crop["Left"].ToInt32();
        var top = crop["Top"].ToInt32();
        var right = crop["Right"].ToInt32();
        var bottom = crop["Bottom"].ToInt32();
        var widgets = string.Join(", ", crop["WidgetsValues"].AsBsonArray.Select(v => v.ToInt32()));
        string image = template["Image"].AsString;

        return $@"
{{
  ""prompt"": {{
    ""2"": {{
      ""class_type"": ""LoadImage"",
      ""inputs"": {{
        ""image"": ""{image}""
      }}
    }},
    ""3"": {{
      ""class_type"": ""LoadImage"",
      ""inputs"": {{
        ""image"": ""{userImage}""
      }}
    }},
    ""12"": {{
      ""class_type"": ""Image Crop Location"",
      ""inputs"": {{
        ""image"": [""3"", 0],
        ""left"": {left},
        ""top"": {top},
        ""right"": {right},
        ""bottom"": {bottom}
      }},
      ""widgets_values"": [{widgets}]
    }},
    ""8"": {{
      ""class_type"": ""Image Paste Crop"",
      ""inputs"": {{
        ""image"": [""2"", 0],
        ""crop_image"": [""3"", 0],
        ""crop_data"": [""12"", 1],
        ""crop_sharpening"": 0,
        ""crop_blending"": 0
      }}
    }},
    ""1"": {{
      ""class_type"": ""ReActorFaceSwap"",
      ""inputs"": {{
        ""input_image"": [""2"", 0],
        ""source_image"": [""3"", 0],
        ""face_model"": ""inswapper_128.onnx"",
        ""face_restore_visibility"": 1,
        ""console_log_level"": 1,
        ""detect_gender_input"": ""no"",
        ""facedetection"": ""retinaface_resnet50"",
        ""source_faces_index"": ""0"",
        ""enabled"": true,
        ""swap_model"": ""inswapper_128.onnx"",
        ""input_faces_index"": ""0"",
        ""face_restore_model"": ""GFPGANv1.3.pth"",
        ""detect_gender_source"": ""no"",
        ""codeformer_weight"": 0.5,
        ""blend_ratio"": 0.5
      }}
    }},
    ""9"": {{
      ""class_type"": ""PreviewImage"",
      ""inputs"": {{
        ""images"": [""1"", 0],
        ""filename_prefix"": ""FaceSwap_Result""
      }}
    }},
    ""4"": {{
      ""class_type"": ""SaveImage"",
      ""inputs"": {{
        ""images"": [""1"", 0],
        ""filename_prefix"": ""FaceSwap_Result""
      }}
    }}
  }}
}}";
    }
    public async Task ClearRenderQueueAsync()
    {
      await _renderQueueRepository.ClearQueueAsync();
    }
}
