import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Button, Typography, Modal, CircularProgress, Alert,
  Card, CardMedia, CardContent, IconButton } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Типы данных
interface ImageMessage {
  type: 'image';
  url: string;
  filename: string;
  data?: string;
  messageId?: string;
  sessionId?: string;
}

// Проверка типа для ImageMessage
const isImageMessage = (obj: any): obj is ImageMessage => {
  return obj?.type === 'image' && 
         typeof obj?.url === 'string' && 
         typeof obj?.filename === 'string';
};

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Состояния
  const [images, setImages] = useState<ImageMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const receivedMessageIds = useRef<Set<string>>(new Set());

  // Инициализация состояния из location.state
  useEffect(() => {
    if (location.state?.initialImage && isImageMessage(location.state.initialImage)) {
      setImages([location.state.initialImage]);
    }
  }, [location.state]);

  // Подключение WebSocket
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const sessionId = location.state?.sessionId || 'default-session';
    const wsUrl = `ws://localhost:5286/api/public/ws?sessionId=${sessionId}`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setConnectionStatus('connected');
      setError(null);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (isImageMessage(data) && !receivedMessageIds.current.has(data.url)) {
          receivedMessageIds.current.add(data.url);
          setImages(prev => [...prev, data]);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
        setError('Ошибка при получении данных');
      }
    };

    wsRef.current.onerror = () => {
      setConnectionStatus('disconnected');
      setError('Ошибка подключения к серверу');
    };

    wsRef.current.onclose = () => {
      setConnectionStatus('disconnected');
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleBack = () => navigate('/');

  const getImageSource = (img: ImageMessage | null): string => {
    if(img === null){
      return ''; 
    }
    return img.data ? `data:image/png;base64,${img.data}` : img.url;
  };

  // Рендер загрузки
  if (connectionStatus === 'connecting') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Подключение к серверу...</Typography>
      </Box>
    );
  }

  // Рендер при отсутствии изображений
  if (images.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={handleBack} 
          sx={{ mb: 3 }}
          startIcon={<ArrowBackIcon />}
        >
          Завершить
        </Button>
        <Typography variant="h4">
          {error || 'Ваши изображения загружаются'}
        </Typography>
        {connectionStatus === 'disconnected' && (
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={connectWebSocket}
          >
            Повторить попытку
          </Button>
        )}
      </Box>
    );
  }

  // Основной рендер
  return (
    <Box sx={{ p: 3 }}>
      <Button 
        variant="outlined" 
        onClick={handleBack} 
        sx={{ mb: 3 }}
        startIcon={<ArrowBackIcon />}
      >
        Завершить
      </Button>

      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center'}}>
        Ваши изображения
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexWrap="wrap" gap={3}>
        {images.map((image) => (
          <Card 
            key={image.url}
            sx={{ 
              width: 300,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
            onClick={() => setSelectedImage(image)}
          >
            <CardMedia
              component="img"
              height="200"
              image={getImageSource(image)}
              alt={image.filename !== null ? 'Кликните на картинку' : 'Кликните на картинку'}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Typography gutterBottom variant="h6" noWrap>
                {'Кликните на картинку'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Модальное окно с QR-кодом */}
      <Modal
        open={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}
      >
        <Box sx={{
          width: 360,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <IconButton
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8
            }}
            onClick={() => setSelectedImage(null)}
            size="large"
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" gutterBottom>
            QR-код изображения
          </Typography>

          
          {/* {selectedImage && ( */}
            <QRCodeSVG 
              value={selectedImage?.url ?? ''}
              size={256}
              level="H"
              includeMargin
            />
          {/* )} */}

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Отсканируйте QR-код для получения изображения
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default ResultPage;