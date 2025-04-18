using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using SDService.Services;

namespace SDService.Controllers;

[ApiController]
[Route("api/public")]
public class WebSocketController : ControllerBase
{
    private readonly WebSocketConnectionManager _connectionManager;
    private readonly ApiService _apiService;

    public WebSocketController(WebSocketConnectionManager connectionManager, ApiService apiService)
    {
        _connectionManager = connectionManager;
        _apiService = apiService;
    }

    [HttpGet("ws")]
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            _connectionManager.AddSocket(webSocket);
            await EchoLoop(webSocket);
        }
        else
        {
            HttpContext.Response.StatusCode = 400;
        }
    }

    private async Task EchoLoop(WebSocket socket)
    {
        var buffer = new byte[1024 * 4];

        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            if (result.MessageType == WebSocketMessageType.Text)
            {
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);

                // Рассылаем всем
                var tasks = _connectionManager.GetAll()
                    .Where(s => s.State == WebSocketState.Open)
                    .Select(s =>
                    {
                        var data = Encoding.UTF8.GetBytes(message);
                        return s.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Text, true, CancellationToken.None);
                    });

                await Task.WhenAll(tasks);
            }
            else if (result.MessageType == WebSocketMessageType.Close)
            {
                _connectionManager.RemoveSocket(socket);
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
            }
        }
    }
}