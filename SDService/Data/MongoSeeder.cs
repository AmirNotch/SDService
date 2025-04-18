using MongoDB.Driver;
using SDService.Models.MongoCollections;

namespace SDService.Data;

public class MongoSeeder
{
    private readonly IMongoDatabase _database;

    public MongoSeeder(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDb"));
        _database = client.GetDatabase("StableDeffusionDB"); // Заменить на нужное имя
    }

    public async Task SeedAsync()
    {
        var collectionName = "portraits";

        var collections = await _database.ListCollectionNames().ToListAsync();
        if (!collections.Contains(collectionName))
        {
            var portraits = GetSeedData();
            var collection = _database.GetCollection<Portrait>(collectionName);
            await collection.InsertManyAsync(portraits);
        }
    }

    private List<Portrait> GetSeedData()
    {
        return new List<Portrait>
        {
            new Portrait
            {
                Image = "Ж_Внедрение_1_Масленица.png",
                Sex = "Female",
                TypeOfFunction = "CropFace",
                Crop = new CropData
                {
                    Left = 450,
                    Top = 200,
                    Right = 1250,
                    Bottom = 500,
                    WidgetsValues = new List<int> { 450, 200, 1250, 500 }
                }
            },
            new Portrait
            {
                Image = "Ж_Внедрение_2_Ярмарка.png",
                Sex = "Female",
                TypeOfFunction = "CropFace",
                Crop = new CropData
                {
                    Left = 1000,
                    Top = 600,
                    Right = 500,
                    Bottom = 550,
                    WidgetsValues = new List<int> { 1000, 600, 500, 550 }
                }
            },
            new Portrait
            {
                Image = "Ж_Внедрение_4_Сенокос.png",
                Sex = "Female",
                TypeOfFunction = "CropFace",
                Crop = new CropData
                {
                    Left = 250,
                    Top = 300,
                    Right = 1500,
                    Bottom = 720,
                    WidgetsValues = new List<int> { 250, 300, 1500, 720 }
                }
            },
            new Portrait
            {
                Image = "Ж_Внедрение_5_Гулянье.png",
                Sex = "Female",
                TypeOfFunction = "CropFace",
                Crop = new CropData
                {
                    Left = 500,
                    Top = 175,
                    Right = 1000,
                    Bottom = 750,
                    WidgetsValues = new List<int> { 500, 175, 1000, 750 }
                }
            },new Portrait
            {
                Image = "Ж_Замена_1_Шеповалова.png",
                Sex = "Female",
                TypeOfFunction = "SwapFace",
                Crop = new CropData
                {
                    Left = 0,
                    Top = 0,
                    Right = 0,
                    Bottom = 0,
                    WidgetsValues = new List<int> { 0, 0, 0, 0 }
                }
            },
            new Portrait
            {
                Image = "Ж_Замена_2_Кустодиева.jpg",
                Sex = "Female",
                TypeOfFunction = "SwapFace",
                Crop = new CropData
                {
                    Left = 0,
                    Top = 0,
                    Right = 0,
                    Bottom = 0,
                    WidgetsValues = new List<int> { 0, 0, 0, 0 }
                }
            },
            new Portrait
            {
                Image = "М_Внедрение_1_Масленица.png",
                Sex = "Male",
                TypeOfFunction = "CropFace",
                Crop = new CropData
                {
                    Left = 700,
                    Top = 200,
                    Right = 1000,
                    Bottom = 650,
                    WidgetsValues = new List<int> { 700, 200, 1000, 650 }
                }
            },
            new Portrait
            {
                Image = "М_Внедрение_2_Ярмарка.png",
                Sex = "Male",
                TypeOfFunction = "CropFace",
                Crop = new CropData
                {
                    Left = 1000,
                    Top = 600,
                    Right = 500,
                    Bottom = 550,
                    WidgetsValues = new List<int> { 1000, 600, 500, 550 }
                }
            },
            new Portrait
            {
                Image = "М_Внедрение_4_Сенокос.png",
                Sex = "Male",
                TypeOfFunction = "CropFace",
                Crop = new CropData
                {
                    Left = 400,
                    Top = 500,
                    Right = 1250,
                    Bottom = 800,
                    WidgetsValues = new List<int> { 400, 500, 1250, 800 }
                }
            },
            new Portrait
            {
                Image = "М_Внедрение_5_Гулянье.png",
                Sex = "Male",
                TypeOfFunction = "CropFace",
                Crop = new CropData
                {
                    Left = 500,
                    Top = 250,
                    Right = 1000,
                    Bottom = 800,
                    WidgetsValues = new List<int> { 500, 250, 1000, 800 }
                }
            },
            new Portrait
            {
                Image = "М_Замена_1_Щусев.jpg",
                Sex = "Male",
                TypeOfFunction = "SwapFace",
                Crop = new CropData
                {
                    Left = 0,
                    Top = 0,
                    Right = 0,
                    Bottom = 0,
                    WidgetsValues = new List<int> { 0, 0, 0, 0 }
                }
            },
            new Portrait
            {
                Image = "М_Замена_2_Шаляпин.png",
                Sex = "Male",
                TypeOfFunction = "SwapFace",
                Crop = new CropData
                {
                    Left = 0,
                    Top = 0,
                    Right = 0,
                    Bottom = 0,
                    WidgetsValues = new List<int> { 0, 0, 0, 0 }
                }
            }
        };
    }
}
