import React from 'react';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import curtainSvg from '../images/curtains.svg';
import mirror1Svg from '../images/left mirror.svg';
import mirror2Svg from '../images/right mirror.svg';
import peopleSvg from '../images/people.png';
import '../App.css'
import bgImage from '../images/frame-17.png';
import '../App.css'


const GenderSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const isVertical = useMediaQuery('(max-width: 1080px) and (min-height: 1920px)');

  const handleGenderSelect = (gender: string) => {
    navigate('/take-photo', {
      state: {
        gender: gender === 'Мужской' ? 'Male' : 'Female',
      },
    });
  };

  return (
    <Box
      sx={{
        height: '100vh',
        px: isVertical ? '6rem' : '2rem',
        py: isVertical ? '4rem' : '2rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Анимация людей снизу */}
      <motion.img
        src={peopleSvg}
        alt="People"
        initial={{ opacity: 0, y: 700, x: -540 }} // появляется снизу
        animate={{ opacity: 1, y: -720, x: -540 }}   // доходит до нужного положения
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

      {/* Анимация штор сверху */}
      <motion.img
        src={curtainSvg}
        alt="Curtains"
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

      {/* Анимация зеркала слева */}
      <motion.img
        src={mirror1Svg}
        alt="Mirror Left"
        initial={{ opacity: 0, x: -200, y: -120 }}
        animate={{ opacity: 1, x: 100, y: -520 }}
        transition={{ duration: 1.8 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: isVertical ? '5%' : '10%',
          transform: 'translateY(-50%)',
          width: isVertical ? '30%' : '10%',
          zIndex: 0,
        }}
      />

      {/* Анимация зеркала справа */}
      <motion.img
        src={mirror2Svg}
        alt="Mirror Right"
        initial={{ opacity: 0, x: 200, y: 400 }}
        animate={{ opacity: 1, x: -10, y: 100 }}
        transition={{ duration: 1.8 }}
        style={{
          position: 'absolute',
          top: '35%',
          right: isVertical ? '5%' : '10%',
          width: isVertical ? '30%' : '10%',
          zIndex: 0,
        }}
      />

      {/* Текст — чуть выше центра */}
      <Box sx={{ mt: isVertical ? '10vh' : '6vh' }}>
        <motion.div
          initial={{ y: -300, opacity: 0 }}
          animate={{ y: 460, opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: 0.2,
            ease: 'easeOut',
          }}
          style={{ width: 'auto' }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: isVertical ? '5rem' : '2rem',
              textAlign: 'center',
              color: '#FFFFFF',
            }}
          >
            Укажите Ваш пол
          </Typography>
        </motion.div>
      </Box>

      {/* Кнопки — у нижней границы */}
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: -200, x: -15, opacity: 1 }}
        transition={{
          duration: 1.2,
          delay: 0.2,
          ease: 'easeOut',
        }}
        style={{
          display: 'flex',
          flexDirection: 'column', // Убедись, что кнопки расположены вертикально
          gap: isVertical ? '2rem' : '1.5rem', // Это расстояние между кнопками
          width: '100%',
          alignItems: 'center', // Центрирование кнопок по горизонтали
        }}
      >
        <Button
          variant="contained"
          onClick={() => handleGenderSelect('Мужской')}
          sx={{
            backgroundColor: 'rgba(26, 114, 124, 0.7)', // прозрачный фон
            border: '6px solid white',
            color: 'white',
            '&:hover': {
              backgroundColor: '#155f68',
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out',
            padding: isVertical ? '2rem 4rem' : '1rem 2rem',
            borderRadius: isVertical ? '40px' : '12px',
            width: isVertical ? '100%' : '20%',
            maxWidth: '750px',
            fontFamily: 'SB Sans Display, sans-serif',
            fontSize: isVertical ? '3rem' : '2rem', // увеличиваем размер букв
            letterSpacing: '0.10em', // расстояние между буквами
            textTransform: 'none', // Убираем преобразование в верхний регистр
          }}
        >
          Мужской
        </Button>

        <Button
          variant="contained"
          onClick={() => handleGenderSelect('Женский')}
          sx={{
            backgroundColor: 'rgba(26, 114, 124, 0.7)', // прозрачный фон
            border: '6px solid white',
            color: 'white', // непрозрачный текст
            '&:hover': {
              backgroundColor: '#155f68',
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out',
            padding: isVertical ? '2rem 4rem' : '1rem 2rem',
            borderRadius: isVertical ? '40px' : '12px',
            width: isVertical ? '100%' : '20%',
            maxWidth: '750px',
            fontFamily: 'SB Sans Display, sans-serif',
            fontSize: isVertical ? '3rem' : '2rem', // увеличиваем размер букв
            letterSpacing: '0.10em', // расстояние между буквами
            textTransform: 'none', // Убираем преобразование в верхний регистр
          }}
        >
          Женский
        </Button>
      </motion.div>
    </Box>
  );
};

export default GenderSelectionPage;
