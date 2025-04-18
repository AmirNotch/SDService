using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SDService.Models.MongoCollections;

public class Portrait
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string Image { get; set; }
    public string Sex { get; set; }
    public string TypeOfFunction { get; set; }
    public CropData Crop { get; set; }
}