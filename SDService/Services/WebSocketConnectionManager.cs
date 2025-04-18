using System.Net.WebSockets;
using System.Collections.Concurrent;

namespace SDService.Services
{
    public class WebSocketConnectionManager
    {
        private readonly ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();

        public void AddSocket(WebSocket socket)
        {
            var socketId = Guid.NewGuid().ToString();
            _sockets[socketId] = socket;
        }

        public void RemoveSocket(WebSocket socket)
        {
            var socketId = _sockets.FirstOrDefault(s => s.Value == socket).Key;
            if (socketId != null)
            {
                _sockets.TryRemove(socketId, out _);
            }
        }

        public IEnumerable<WebSocket> GetAll()
        {
            return _sockets.Values;
        }
    }
}