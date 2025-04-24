import React, { useEffect, useState } from 'react';
import { Box, Modal, Button, Typography, CircularProgress, Alert } from '@mui/material';
import QRCode from 'qrcode.react';

interface ImageMessage {
  type: 'image';
  url: string;
  filename: string;
  data?: string;
}

interface ResultPageProps {
  initialData?: any;
}

const WebSocketComponent: React.FC<ResultPageProps> = ({ initialData }) => {
  const [messages, setMessages] = useState<ImageMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Если есть initialData, добавляем их в сообщения
    if (initialData?.images) {
      setMessages(prev => [...prev, ...initialData.images]);
      setLoading(false);
    }

    const ws = new WebSocket('ws://stableDeffusion.api:8080/api/public/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setLoading(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'image') {
          setMessages(prev => [...prev, data]);
        } 
        else if (data.type === 'progress') {
          console.log(`Прогресс: ${data.progress}%`);
        }
        else if (data.type === 'error') {
          setError(data.message || 'Ошибка обработки');
        }
      } catch (error) {
        console.error('Error parsing message:', error);
        setError('Ошибка обработки сообщения от сервера');
      }
    };
    

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Ошибка подключения к серверу');
      setLoading(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setLoading(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [initialData]);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Результаты обработки
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            {initialData ? 'Загружаем результаты...' : 'Подключаемся к серверу...'}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        {messages.map((message, index) => (
          <Box 
            key={index} 
            sx={{ 
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: 1,
              overflow: 'hidden',
              '&:hover': { boxShadow: 2 },
              position: 'relative'
            }}
          >
            <img 
              src={message.url} 
              alt={message.filename} 
              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              onClick={() => handleImageClick(message.url)}
            />
            <Typography variant="caption" display="block" textAlign="center" p={1}>
              {message.filename}
            </Typography>
            <Button
              size="small"
              variant="contained"
              sx={{ position: 'absolute', bottom: 8, right: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(message.url, message.filename);
              }}
            >
              Скачать
            </Button>
          </Box>
        ))}
      </Box>

      <Modal
        open={!!selectedImage}
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 4, 
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '90%'
        }}>
          {selectedImage && (
            <>
              <QRCode 
                value={selectedImage}
                size={256}
                level="H"
                includeMargin={true}
              />
              <Box mt={2} display="flex" gap={2}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.open(selectedImage, '_blank')}
                >
                  Открыть оригинал
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleCloseModal}
                >
                  Закрыть
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default WebSocketComponent;