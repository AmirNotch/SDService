import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../LoadingPage.css';
import Component1SVG from '../images/Component-1.svg';
import Component2SVG from '../images/Component-2.png';
import Component3SVG from '../images/Component-3.png';
import Component4SVG from '../images/Component-4.png';

import { Typography } from '@mui/material';

interface ImageMessage {
  type: 'image';
  url: string;
  filename: string;
  data?: string;
  messageId?: string;
  sessionId?: string;
}

// Функция проверки типа (добавьте её в ваш файл или импортируйте)
const isImageMessage = (obj: any): obj is ImageMessage => {
  return obj?.type === 'image' && 
         typeof obj?.url === 'string' && 
         typeof obj?.filename === 'string';
};

const LoadingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const wsRef = useRef<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const receivedMessages = useRef<Set<string>>(new Set());
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loadingImages = [
        Component1SVG,
        Component2SVG,
        Component3SVG,
        Component4SVG
    ];

    // Получаем sessionId из location.state
    const sessionId = location.state?.sessionId || 'default-session';

    // Эффект для циклической смены изображений
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % loadingImages.length);
        }, 2000); // Смена каждые 2 секунды

        return () => clearInterval(interval);
    }, []);

    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(`ws://stabledeffusion.api:8080/api/public/ws?sessionId=${sessionId}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (isImageMessage(data)) {
                    const uniqueId = data.messageId || `${data.url}-${Date.now()}`;
                    
                    if (!receivedMessages.current.has(uniqueId)) {
                        receivedMessages.current.add(uniqueId);
                        
                        // Закрываем соединение перед переходом
                        ws.close();
                        
                        // Переходим на ResultPage с данными
                        navigate('/result', {
                            state: {
                                initialImage: {
                                    ...data
                                },
                                sessionId: sessionId
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('Error parsing message:', err);
                setError('Ошибка при получении данных');
            }
        };

        ws.onerror = () => {
            setError('Ошибка подключения к серверу');
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [navigate, sessionId]);

    useEffect(() => {
        connectWebSocket();
    }, [connectWebSocket]);

    return (
        <div className="loading-page">
            <div className="spinner-container">
                <img
                    src={loadingImages[currentImageIndex]}
                    alt="Loading"
                    className="spinner spin"
                />
                
            </div>
        </div>
    );
};

export default LoadingPage;