import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 New message:', data);
        // Обработка данных, например, сохранение в state или dispatch
      } catch (err) {
        console.warn('⚠️ Received non-JSON data:', event.data);
      }
    };

    socket.onclose = () => {
      console.log('❌ WebSocket closed');
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [url]);

  // Функция для отправки сообщений через WebSocket
  const sendMessage = (message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
      console.log('📤 Sent message:', message);
    } else {
      console.error('❌ WebSocket is not open');
    }
  };

  return {
    socketRef,
    sendMessage,
    isConnected,
  };
};
