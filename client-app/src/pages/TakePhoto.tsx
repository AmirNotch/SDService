// src/pages/TakePhoto.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TakePhoto = () => {
  const { state } = useLocation();
  const { gender } = state || {};  // Получаем выбранный пол
  const [timeLeft, setTimeLeft] = useState(3); // Таймер с отсчётом
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null); // Хранение соединения WebSocket
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Подключаемся к WebSocket серверу
    const socket = new WebSocket('ws://localhost:5286/api/public/ws');
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('Message from server:', event.data);
      // Обработка входящих сообщений от сервера
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setWebSocket(socket);

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    // Получаем доступ к камере
    const getCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };
    getCamera();

    // Устанавливаем таймер
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsTakingPhoto(true);
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTakePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        // Отправляем фото на сервер через WebSocket (например, в виде изображения Base64)
        if (webSocket) {
          const imageData = canvasRef.current.toDataURL('image/png');
          webSocket.send(JSON.stringify({ action: 'takePhoto', image: imageData }));
        }
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h2>Улыбнитесь, сейчас вас сфоткают через {timeLeft} секунд</h2>
      <div style={{ marginBottom: '20px', position: 'relative', display: 'inline-block' }}>
        <video ref={videoRef} autoPlay width="300" height="300" style={{ borderRadius: '50%' }} />
        {isTakingPhoto && <button onClick={handleTakePhoto} style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>Сделать фото</button>}
      </div>
      <canvas ref={canvasRef} width="300" height="300" style={{ display: 'none' }} />
    </div>
  );
};

export default TakePhoto;
