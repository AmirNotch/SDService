import React from 'react';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import cloudSvg from '../images/clouds.png';
import birdSvg from '../images/bird.svg';
import fieldSvg from '../images/fields.svg';
import '../App.css'
import bgImage from '../images/frame-20.png';

const WarningPage: React.FC = () => {
  const navigate = useNavigate();
  const isFullHD = useMediaQuery('(max-width: 1920px)'); // Для Full HD и меньше
  const isLargerThanFullHD = useMediaQuery('(min-width: 1921px)'); // Для экранов больше Full HD

  const isVertical = useMediaQuery('(max-width: 1080px) and (min-height: 1920px)');

  const handleAgree = () => {
    navigate('/gender');
  };

  const handleDisagree = () => {
    navigate('/');
  };

  return (
    <Box
      overflow={'hidden'}
      width={'100vw'}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      height="100vh"
      px={3}
      py={4}
      sx={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Анимация полей снизу */}
      <motion.img
        src={fieldSvg}
        alt="Fields"
        initial={{ opacity: 0, y: 700, x: -540 }} // появляется снизу
        animate={{ opacity: 1, y: -420, x: -540 }}   // доходит до нужного положения
        transition={{ duration: 1.8 }}
        style={{
          position: 'absolute',
          top: '60%',                     // немного ниже центра экрана
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isVertical ? '100%' : '35%',
          zIndex: 0, // делает его фоном
        }}
      />

      {/* Анимация облаков сверху */}
      <motion.img
        src={cloudSvg}
        alt="Clouds and Sber Avatar"
        initial={{ opacity: 0, y: -150, x: -540 }}
        animate={{ opacity: 1, y: 0, x: -540 }}
        transition={{ duration: 1.5 }}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: isVertical ? '100%' : '40%',
          zIndex: 0,
        }}
      />

      {/* Анимация птицы справа */}
      <motion.img
        src={birdSvg}
        alt="Bird Right"
        initial={{ opacity: 0, x: 200, y: -100 }}
        animate={{ opacity: 1, x: 50, y: -140 }}
        transition={{ duration: 1.8 }}
        style={{
          position: 'absolute',
          top: '35%',
          right: isVertical ? '5%' : '10%',
          width: isVertical ? '15%' : '10%',
          zIndex: 0,
        }}
      />


      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 160, x: 130, opacity: 1 }}
        transition={{
          duration: 1,
          ease: 'easeOut',
        }}
        style={{ width: '100%' }}
      >
        <Box
          display="flex"
          justifyContent="flex-start" // 👈 выравнивание по левому краю
          alignItems="flex-start"     // 👈 по верхнему краю
          textAlign="left"            // 👈 в Box можно продублировать для надёжности
          flex={1}
          mt={-6}
          width="100%"
          px={3}
        >
          <Typography
            variant="h4"
            align="left" // 👈 здесь главное
            sx={{
              fontSize: isVertical ? '2.5rem' : '1.75rem',
              wordBreak: 'break-word',
              maxWidth: '750px',
              fontWeight: 500,
              fontFamily: 'SB Sans Display, sans-serif',
            }}
          >
            СОГЛАСИЕ НА ОБРАБОТКУ ФОТОГРАФИИ
            <br />
            Нажимая кнопку «Согласен / Сделать фото», вы подтверждаете, что:
            <br />
            1) Соглашаетесь на съёмку 
            <br />
            и обработку изображения вашего лица (биометрических данных) 
            <br />
            в развлекательных целях;
            <br />
            2) Ваше фото будет использовано только для создания стилизованного изображения 
            <br />
            и показано на экране;
            <br />
            - Исходная фотография будет удалена сразу после обработки;
            <br />
            - Финальное изображение 
            <br />
            не хранится, если вы сами 
            <br />
            не выберете функцию «Скачать / Отправить»;
            <br />
            - Обработка информации будет осуществляться при помощи Kandinsky.
            <br />
            Если вы не согласны, вернитесь 
            <br />
            в меню.
            Для продолжения нажмите
            <br />
            «Согласен / Сделать фото».
          </Typography>
        </Box>
      </motion.div>

      <motion.div
        initial={{ y: 200, x: 30, opacity: 0 }} // Начальная позиция снизу
        animate={{ y: -50, opacity: 1 }} // Двигаемся вверх до 0 (появляемся)
        transition={{
          duration: 1.2,
          delay: 0.2,
          ease: 'easeOut',
        }}
        style={{ width: 'auto' }}
      >
        <Box
          display="flex"
          textAlign="center"
          flexDirection="column"
          gap={3}
          width={isLargerThanFullHD ? '120%' : '150%'} // Для больших экранов уменьшаем ширину
          maxWidth="750px"
          mb={4}
          sx={{
            marginLeft: isLargerThanFullHD ? '-50px' : '-110px', // Изменяем сдвиг влево для больших экранов
            fontFamily: 'SB Sans Display, sans-serif',
          }}
        >
          <Button
            onClick={handleAgree}
            variant="contained"
            sx={{
              backgroundColor: 'rgba(26, 114, 124, 0.7)', // прозрачный фон
              border: '6px solid white',
              color: 'white',
              '&:hover': {
                backgroundColor: '#155f68',
                transform: 'scale(1.05)',
              },
              transition: 'transform 0.2s ease-in-out',
              fontSize: isVertical ? '3rem' : '2rem', // увеличиваем размер букв
              letterSpacing: '0.10em', // расстояние между буквами
              padding: isVertical ? '2rem 4rem' : '1rem 2rem',
              borderRadius: isVertical ? '40px' : '12px',
              width: '100%',
              maxWidth: '750px',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              textTransform: 'none', // Убираем преобразование в верхний регистр
            }}
          >
            Принять и продолжить
          </Button>

          <Button
            onClick={handleDisagree}
            variant="text"
            sx={{
              color: 'black',
              fontSize: isVertical ? '2.5rem' : '1rem',
              padding: isVertical ? '1rem' : '0.5rem',
              textTransform: 'none',
              boxShadow: 'none',
              width: '100%',
              fontFamily: 'SB Sans Display, sans-serif',
              fontWeight: 'bold',
              letterSpacing: '0.10em', // расстояние между буквами
            }}
          >
            Вернуться в меню
          </Button>
        </Box>
      </motion.div>

    </Box>
  );
};

export default WarningPage;
