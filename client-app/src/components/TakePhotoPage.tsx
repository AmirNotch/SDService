import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, IconButton } from '@mui/material';
import Webcam from 'react-webcam';

import ArrowIcon from '../images/Arrow 1.svg'; // путь к стрелке
import ShutterBefore from '../images/Shutter.svg';
import ShutterAfter from '../images/Shutter after.svg';

interface ProcessResult {
  url?: string;
  filename?: string;
  error?: string;
  sessionId?: string;
}

interface UploadResponse {
  message: string;
  comfyResponse: string;
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
  const [shutterClicked, setShutterClicked] = useState<boolean>(false);
  const isProcessingRef = useRef(false);

  const gender = location.state?.gender || 'Male';

  const videoConstraints = {
    facingMode: 'user',
    width: 720,
    height: 720,
  };

  const startCountdown = () => {
    if (isProcessingRef.current) return;
    setShutterClicked(true);
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
    }, 500);

    return () => clearInterval(timer);
  }, [isCounting]);

  const uploadImage = async (imageBlob: Blob): Promise<ComfyResponse> => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'photo.jpg');

    const response = await fetch('http://localhost:5286/api/comfy/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Ошибка загрузки: ${response.statusText}`);
    const result: UploadResponse = await response.json();

    try {
      const comfyData: ComfyResponse = JSON.parse(result.comfyResponse);
      if (!comfyData.name) throw new Error('Не получено имя файла от сервера');
      return comfyData;
    } catch (e) {
      throw new Error(`Ошибка парсинга ответа: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const processImage = async (imageName: string): Promise<ProcessResult> => {
    const response = await fetch(
      `http://localhost:5286/api/comfy/process?userImageName=${encodeURIComponent(imageName)}&gender=${gender}`,
      { method: 'POST' }
    );

    if (!response.ok) throw new Error('Ошибка обработки изображения');

    const result = await response.json();
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { ...result, sessionId };
  };

  const captureAndUploadPhoto = async () => {
    if (isProcessingRef.current || !webcamRef.current) return;

    isProcessingRef.current = true;
    setIsUploading(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error('Не удалось сделать фото');

      const imageBlob = await fetch(imageSrc).then(res => res.blob());

      // 3. Загружаем на сервер (первый запрос)
      const uploadResult = await uploadImage(imageBlob);
      console.log('Имя файла из ответа:', uploadResult.name);

      // 4. Обрабатываем изображение (второй запрос)
      const processResult = await processImage(uploadResult.name);


      // Переходим на LoadingPage сразу после захвата фото
      navigate('/loading', {
        state: { imageBlob },  // Можешь передать изображение для дальнейшей обработки
      });

    } catch (err) {
      console.error('Ошибка:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      navigate('/loading', {
        state: { error: err instanceof Error ? err.message : 'Неизвестная ошибка' },
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
      sx={{ backgroundColor: 'black', color: 'white' }}
    >
      {!isCounting && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box position="relative">
        {/* Вебкамера по центру */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Box
            position="relative"
            width={800}
            height={800}
            borderRadius="100%"
            overflow="hidden"
            bgcolor="black" // фоновый цвет, чтобы не было белых краёв
          >
            <Box
              position="absolute"
              top={-10} // ← подвинь вверх
              left={-10} // ← подвинь влево
              width="calc(100% + 20px)"
              height="calc(100% + 20px)"
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
                  display: 'block', // убираем лишние inline-артефакты
                }}
              />
            </Box>

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
        </Box>

        {/* Подсказка у левой стенки экрана */}
        {!isCounting && (
          <Box
            position="absolute"
            bottom={-100}
            left={-110}
            display="flex"
            alignItems="center"
            sx={{
              fontFamily: 'SB Sans Display, sans-serif',
            }}
          >
            <img src={ArrowIcon} alt="arrow" style={{ width: 60, marginRight: 8 }} />
            <Typography variant="body1" color="white">
              Посмотрите в камеру,
              <br />
              она находится слева
            </Typography>
          </Box>
        )}
      </Box>

      {/* Кнопка-затвор внизу экрана */}
      {!isUploading && (
        <Box
          position="fixed"
          bottom={100}
          left="50%"
          sx={{
            transform: 'translateX(-50%)',
            fontFamily: 'SB Sans Display, sans-serif',
            letterSpacing: '0.10em', // расстояние между буквами
          }}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          {!isCounting && (
            <Typography variant="body1" mb={1}>
              Нажмите, чтобы сделать фото
            </Typography>
          )}
          <IconButton onClick={startCountdown} disabled={isCounting || isUploading}>
            <img
              src={shutterClicked ? ShutterAfter : ShutterBefore}
              alt="shutter"
              style={{ width: 160, height: 160 }}
            />
          </IconButton>
        </Box>
      )}

      {/* Прелоадер */}
      {/* {isUploading && (
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress color="inherit" />
          <Typography>Отправка фото на сервер...</Typography>
        </Box>
      )} */}
    </Box>
  );
};

export default TakePhotoPage;
