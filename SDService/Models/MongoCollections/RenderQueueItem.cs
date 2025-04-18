using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SDService.Models.MongoCollections;

public class RenderQueueItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    [BsonElement("prompt_id")]
    public string Prompt_Id { get; set; }

    [BsonElement("number")]
    public int Number { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "Pending"; // по умолчанию Pending
}
