import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import Webcam from 'react-webcam';

interface ProcessResult {
  url?: string;
  filename?: string;
  error?: string;
  sessionId?: string;
}

interface UploadResponse {
  message: string;
  comfyResponse: string; // JSON строка
}

interface ComfyResponse {
  name: string;
  subfolder?: string;
  type?: string;
}

const TakePhotoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const webcamRef = useRef<Webcam>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  const gender = location.state?.gender || 'Male';

  const videoConstraints = {
    facingMode: 'user',
    width: 500,
    height: 500,
  };

  const startCountdown = () => {
    if (isProcessingRef.current) return;
    
    setError(null);
    setIsCounting(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (!isCounting) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isProcessingRef.current) {
            captureAndUploadPhoto();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCounting]);

  // 1. Функция загрузки изображения
  const uploadImage = async (imageBlob: Blob): Promise<ComfyResponse> => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'photo.jpg');

    const response = await fetch('http://localhost:5286/api/comfy/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.statusText}`);
    }

    const result: UploadResponse = await response.json();
    
    try {
      const comfyData: ComfyResponse = JSON.parse(result.comfyResponse);
      if (!comfyData.name) {
        throw new Error('Не получено имя файла от сервера');
      }
      return comfyData;
    } catch (e) {
      throw new Error(`Ошибка парсинга ответа: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // 2. Функция обработки изображения
  const processImage = async (imageName: string): Promise<ProcessResult> => {
    const response = await fetch(
      `http://localhost:5286/api/comfy/process?userImageName=${encodeURIComponent(imageName)}&gender=${gender}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error('Ошибка обработки изображения');
    }

    const result = await response.json();
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return { ...result, sessionId };
  };

  // Основной процесс
  const captureAndUploadPhoto = async () => {
    if (isProcessingRef.current || !webcamRef.current) return;
    
    isProcessingRef.current = true;
    setIsUploading(true);

    try {
      // 1. Делаем снимок
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error('Не удалось сделать фото');

      // 2. Конвертируем в Blob
      const imageBlob = await fetch(imageSrc).then(res => res.blob());

      // 3. Загружаем на сервер (первый запрос)
      const uploadResult = await uploadImage(imageBlob);
      console.log('Имя файла из ответа:', uploadResult.name);

      // 4. Обрабатываем изображение (второй запрос)
      const processResult = await processImage(uploadResult.name);

      // 5. Переходим к результатам
      navigate('/result', {
        state: {
          initialImage: {
            type: 'image',
            url: processResult.url || '',
            filename: processResult.filename || uploadResult.name,
            sessionId: processResult.sessionId,
            error: processResult.error
          }
        }
      });

    } catch (err) {
      console.error('Ошибка:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      
      navigate('/result', {
        state: {
          initialImage: {
            type: 'image',
            error: err instanceof Error ? err.message : 'Неизвестная ошибка'
          }
        }
      });
    } finally {
      isProcessingRef.current = false;
      setIsUploading(false);
      setIsCounting(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
    >
      <Typography variant="h4" gutterBottom>
        Сделайте фото ({gender === 'Male' ? 'Мужской' : 'Женский'})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        position="relative"
        width={500}
        height={500}
        borderRadius="50%"
        overflow="hidden"
        border="4px solid #1976d2"
        mb={3}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
        />
        
        {isCounting && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(0,0,0,0.5)"
          >
            <Typography variant="h1" color="white">
              {countdown}
            </Typography>
          </Box>
        )}
      </Box>

      {!isCounting && !isUploading && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={startCountdown}
          disabled={isUploading}
        >
          Сделать фото
        </Button>
      )}

      {isUploading && (
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress />
          <Typography>Отправка фото на сервер...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default TakePhotoPage;