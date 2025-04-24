import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, CircularProgress, Alert,
  Card, CardMedia, CardContent, IconButton, Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChevronLeft, ChevronRight, Close, Download } from '@mui/icons-material';
import '../ResultPage.css'; // Для стилей
import '../App.css'

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
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const receivedMessages = useRef<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(40); // 40 секунд таймера
  const inactivityTimerRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

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
    const wsUrl = `ws://stabledeffusion.api:8080/api/public/ws?sessionId=${sessionId}`;

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
          resetInactivityTimer();
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

  const handleBack = async () => {
    try {
      // Отправляем запрос на очистку очереди
      const response = await fetch('http://stabledeffusion.api:8080/api/comfy/clear-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        console.error('Ошибка при очистке очереди:', response.statusText);
      }
  
      // Переходим на главную страницу независимо от результата очистки
      navigate('/');
    } catch (error) {
      console.error('Ошибка при очистке очереди:', error);
      navigate('/');
    }  
  }

  const getImageSource = (img: ImageMessage | null): string => {
    if (img === null) {
      return '';
    }
    return img.data ? `data:image/png;base64,${img.data}` : img.url;
  };

  const handleImageClick = (image: ImageMessage) => {
    setSelectedImage(image);
    setShowQRCode(false);
  };

  const handleShowQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  // Выбор изображения
  const selectImage = (index: number) => {
    setSelectedImageIndex(index);
    handleUserActivity();
  };

  // Переключение между изображениями
  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev'
      ? (selectedImageIndex - 1 + images.length) % images.length
      : (selectedImageIndex + 1) % images.length;
    setSelectedImageIndex(newIndex);
    handleUserActivity();
  };

  const handleDownloadClick = () => {
    setDownloadUrl(images[selectedImageIndex]?.url || '');
    setShowQRModal(true);
    handleUserActivity();
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    handleUserActivity();
  };

  // Функция сброса таймера бездействия
  const resetInactivityTimer = () => {
    // Сброс обратного отсчета
    setTimeLeft(40);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Запуск нового таймера
    inactivityTimerRef.current = setTimeout(() => {
      handleBack();
    }, 40000); // 40 секунд

    // Запуск обратного отсчета для отображения
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Обработчики событий активности
  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  useEffect(() => {
    connectWebSocket();
    resetInactivityTimer(); // Запуск таймера при монтировании

    // Добавление обработчиков событий
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      // Удаление обработчиков событий
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, []);


  // // Рендер загрузки
  // if (connectionStatus === 'connecting') {
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
  //       <CircularProgress />
  //       <Typography sx={{ ml: 2 }}>Подключение к серверу...</Typography>
  //     </Box>
  //   );
  // }

  // // Рендер при отсутствии изображений
  if (images.length === 0) {
    return (
      <div className='result-page'>
        <Box sx={{
          height: '100vh'
        }}>
        </Box>
      </div>
    );
  }

  // Основной рендер
  return (
    <div className='result-page'>
      <Box sx={{
        height: '100vh'
      }}>

        {/* {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )} */}

        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1400px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {/* Большая View-панель */}
          <Box sx={{
            position: 'relative',
            width: '970px',
            height: '500px',
            bgcolor: 'background.paper',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 4,
            mb: 4
          }}>
            <CardMedia
              component="img"
              image={getImageSource(images[selectedImageIndex])}
              alt={images[selectedImageIndex]?.filename || 'Selected image'}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover', // ⬅️ Ключ к “приближению”
              }}
            />

            {/* Левая стрелка */}
            <IconButton
              onClick={() => navigateImage('prev')}
              sx={{
                position: 'absolute',
                left: 24,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                width: 60,
                height: 60,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                '& svg': { fontSize: '2.5rem' }
              }}
            >
              <ChevronLeft />
            </IconButton>

            {/* Правая стрелка */}
            <IconButton
              onClick={() => navigateImage('next')}
              sx={{
                position: 'absolute',
                right: 24,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                width: 60,
                height: 60,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                '& svg': { fontSize: '2.5rem' }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Обёртка с подписью и галереей */}
          <Box sx={{ width: '1000px', mt: 8 }}>
            {/* Заголовок */}
            <Typography
              variant="h6"
              sx={{
                mt: 2,    // ⬅️ немного ниже
                ml: 4,    // ⬅️ немного правее
                mb: 2,
                fontWeight: 700,
                fontFamily: 'SB Sans Display, sans-serif',
              }}
            >
              Выбрать другую картину
            </Typography>
            {/* Горизонтальная галерея */}
            <Box sx={{
              position: 'relative',
              width: '1000px',
              height: '200px',
              zIndex: 1,
              borderRadius: 6,
            }}>
              <IconButton
                sx={{
                  position: 'absolute',
                  left: -28,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 4,
                  width: 56,
                  height: 56,
                  '&:hover': { bgcolor: 'action.hover' },
                  '& svg': { fontSize: '2rem' },
                  borderRadius: '30px',
                }}
                onClick={() => scroll('left')}
              >
                <ChevronLeft />
              </IconButton>

              <Box
                ref={containerRef}
                sx={{
                  display: 'flex',
                  gap: 4,
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  py: 3,
                  px: 2,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  borderRadius: '30px',
                }}
              >
                {images.map((image, index) => (
                  <Card
                    key={image.url}
                    sx={{
                      minWidth: 250,
                      maxWidth: 250,
                      flexShrink: 0,
                      height: '200px',
                      scrollSnapAlign: 'start',
                      cursor: 'pointer',
                      border: selectedImageIndex === index
                        ? '4px solid #1976d2'
                        : '2px solid #e0e0e0',
                      transition: 'transform 0.3s, border 0.3s',
                      '&:hover': {
                        transform: 'scale(1.08)',
                        boxShadow: 3,
                      },
                      borderRadius: '20px',
                    }}
                    onClick={() => selectImage(index)}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={getImageSource(image)}
                      alt={image.filename || 'Gallery thumbnail'}
                      sx={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                        borderRadius: '18px',
                      }}
                    />
                  </Card>
                ))}
              </Box>
              <IconButton
                sx={{
                  position: 'absolute',
                  right: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 4,
                  width: 56,
                  height: 56,
                  '&:hover': { bgcolor: 'action.hover' },
                  '& svg': { fontSize: '2rem' }
                }}
                onClick={() => scroll('right')}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          </Box>

          {/* Контейнер для кнопок - вертикальное расположение */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4, // Увеличенный промежуток между кнопками
            mt: 8, // Больший отступ сверху
            mb: -10  // Больший отступ снизу
          }}>
            {/* Кнопка "Скачать картинку" */}
            <Button
              variant="contained"
              onClick={handleDownloadClick}
              sx={{
                backgroundColor: 'rgba(26, 114, 124, 0.7)', // прозрачный фон
                border: '6px solid white',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#155f68',
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.2s ease-in-out',
                padding: '2rem 4rem',
                borderRadius: '40px',
                width: '100%',
                maxWidth: '750px',
                fontFamily: 'SB Sans Display, sans-serif',
                fontSize: '3rem', // увеличиваем размер букв
                letterSpacing: '0.10em', // расстояние между буквами
                textTransform: 'none', // Убираем преобразование в верхний регистр
              }}
            >
              Скачать картинку
            </Button>

            {/* Кнопка "Завершить" */}
            <Button
              variant="text"
              onClick={handleBack}
              sx={{
                color: 'black',
                padding: '1rem',
                textTransform: 'none',
                boxShadow: 'none',
                width: '100%',
                fontFamily: 'SB Sans Display, sans-serif',
                fontWeight: 'bold',
                letterSpacing: '0.05em', // расстояние между буквами
                fontSize: '3rem', // увеличиваем размер букв
              }}
            >
              Вернуться в начало
              <br />
              ({timeLeft} сек)
            </Button>
          </Box>

          {showQRModal && (
            <>
              {/* Фон для затемнения */}
              < Box sx={{
                position: 'fixed',
                top: -500,
                left: -400,
                width: '2000vh',
                height: '2000vh',
                bgcolor: 'rgba(0, 0, 0, 0.7)', // Затемняем фон на 70%
                zIndex: 1200, // Убедитесь, что он под модальным окном
              }} />

              {/* Плавающее окно с QR-кодом */}

              <Box sx={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '900px',
                height: '1000vh',
                minHeight: '1100px', // ⬅️ Увеличение по высоте
                zIndex: 1300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center', // Центрируем содержимое по вертикали
                mb: 4, // Увеличенный промежуток между кнопками
              }}>
                {/* Анимация появления */}
                <Slide direction="down" in={showQRModal} mountOnEnter unmountOnExit>
                  <Box sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 3,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>

                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 0,
                      mb: 2
                    }}>
                      <QRCodeSVG
                        value={downloadUrl}
                        size={700}
                        level="H"
                      />
                    </Box>
                  </Box>
                </Slide>

                {/* Кнопка закрытия - расположена отдельно под окном */}
                <Button
                  variant="contained"
                  onClick={handleCloseModal}
                  sx={{
                    mt: 40, // ⬅️ добавь это для увеличения расстояния от QR-кода
                    backgroundColor: 'rgba(26, 114, 124, 0.7)',
                    border: '6px solid white',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#155f68',
                      transform: 'scale(1.05)',
                    },
                    transition: 'transform 0.2s ease-in-out',
                    fontSize: '4rem',
                    letterSpacing: '0.10em',
                    padding: '2rem 4rem',
                    borderRadius: '40px',
                    width: '110%',
                    maxWidth: '800px',
                    zIndex: 1,
                    animation: 'fadeInScale 1s ease-out',
                    textTransform: 'capitalize',
                  }}
                >
                  Закрыть
                </Button>

              </Box>
            </>

          )}

        </Box>
      </Box>

    </div>
  );
};

export default ResultPage;