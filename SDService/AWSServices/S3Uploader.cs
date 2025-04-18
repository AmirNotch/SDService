using Amazon.S3;
using Amazon.S3.Model;

namespace SDService.AWSServices;

public class S3Uploader
{
    private readonly AmazonS3Client _s3Client;
    private readonly string _bucketName = "rendered-images-stable-deffusion";

    public S3Uploader(string accessKey, string secretKey, string region)
    {
        var regionEndpoint = Amazon.RegionEndpoint.GetBySystemName(region);
        _s3Client = new AmazonS3Client(accessKey, secretKey, regionEndpoint);
    }

    public async Task<string> UploadFileAsync(Stream stream, string fileName)
    {
        var uploadRequest = new PutObjectRequest
        {
            InputStream = stream,
            Key = fileName,
            BucketName = _bucketName,
            ContentType = "image/png", // Указываем MIME тип
            CannedACL = S3CannedACL.PublicRead,
            
            // Основные настройки для скачивания
            Headers = {
                ContentDisposition = $"attachment; filename=\"{fileName}\""
            }
        };
        
        try
        {
            // Отправляем запрос на загрузку файла в S3
            var response = await _s3Client.PutObjectAsync(uploadRequest);

            if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
            {
                // Возвращаем публичную ссылку на файл в S3
                return $"https://{_bucketName}.s3.eu-north-1.amazonaws.com/{fileName}";
            }
            else
            {
                throw new Exception("Ошибка при загрузке файла в S3: " + response.HttpStatusCode);
            }
        }
        catch (Exception ex)
        {
            throw new Exception("Ошибка загрузки файла в S3: " + ex.Message);
        }
    }
}