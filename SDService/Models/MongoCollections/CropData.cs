namespace SDService.Models.MongoCollections;

public class CropData
{
    public int Left { get; set; }
    public int Top { get; set; }
    public int Right { get; set; }
    public int Bottom { get; set; }
    public List<int> WidgetsValues { get; set; }
}