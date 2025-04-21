import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, useMediaQuery } from '@mui/material';
import bgImage from '../images/frame-20.png';
import { motion } from 'framer-motion';
import '../App.css'
import girlAndTreeSvg from '../images/girl and tree.png';
import cloudSvg from '../images/clouds and sber ava.png';
import bird1Svg from '../images/bird 1.svg';
import bird2Svg from '../images/bird 2.svg';

interface WelcomePageProps {
  onStartClick: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStartClick }) => {
  const [connected, setConnected] = useState(false);
  const isVertical = useMediaQuery('(max-width: 1080px) and (min-height: 1920px)');

  useEffect(() => {
    const connect = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setConnected(true);
    };
    connect();

    // 🔒 Блокировка клавиш (например, F5, Ctrl+R и т.д.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Список запрещённых клавиш (F5, Ctrl+R, и другие)
      const blockedKeys = [
        'F5', 'F12', 'Control', 'Shift', 'Alt', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Delete', 'Insert'
      ];

      // Блокируем их
      if (blockedKeys.includes(e.key) || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 🔒 Блокировка всех кнопок мыши, кроме левой (левая = 0)
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) { // 0 = левая кнопка мыши
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 🔒 Блокировка контекстного меню (правая кнопка мыши)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 🔒 Блокировка масштабирования (Ctrl + колесико мыши)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      } else {
        // Блокировка прокрутки
        e.preventDefault();
      }
    };

    // Добавляем слушатели событий
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      // Убираем слушатели событий при размонтировании компонента
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('wheel', handleWheel);
    };

  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        px: isVertical ? '6rem' : '2rem',
        py: isVertical ? '4rem' : '2rem',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >

      {/* Анимация Девушки и Дерева снизу */}
      <motion.img
        src={girlAndTreeSvg}
        alt="Girl and Tree"
        initial={{ opacity: 0, y: 700, x: -540 }} // появляется снизу
        animate={{ opacity: 1, y: -1020, x: -540 }}   // доходит до нужного положения
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

      {/* Анимация облаков и аватарки сверху */}
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
          zIndex: 1,
        }}
      />

      {/* Анимация птицы слева */}
      <motion.img
        src={bird2Svg}
        alt="Bird Left"
        initial={{ opacity: 0, x: -200, y: -120 }}
        animate={{ opacity: 1, x: -30, y: -120 }}
        transition={{ duration: 1.8 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: isVertical ? '5%' : '10%',
          transform: 'translateY(-50%)',
          width: isVertical ? '25%' : '10%',
          zIndex: 2,
        }}
      />

      {/* Анимация птицы справа */}
      <motion.img
        src={bird1Svg}
        alt="Bird Right"
        initial={{ opacity: 0, x: 200, y: -300 }}
        animate={{ opacity: 1, x: 70, y: -340 }}
        transition={{ duration: 1.8 }}
        style={{
          position: 'absolute',
          top: '35%',
          right: isVertical ? '5%' : '10%',
          width: isVertical ? '25%' : '10%',
          zIndex: 2,
        }}
      />

      {/* Верхний текстовый блок */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: isVertical ? '12rem' : '4rem',
          gap: isVertical ? '4rem' : '2rem',
        }}
      >

        {/* СТРАНА */}
        <Box
          sx={{
            position: 'absolute',
            top: isVertical ? '8%' : '7%',
            left: isVertical ? '10%' : '12%',
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -200 }}
            animate={{ opacity: 1, y: 15, x: 200 }}
            transition={{ duration: 1.2 }}
            style={{
              fontSize: isVertical ? '4rem' : '4.5rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#1a727c',
              fontFamily: 'SB Sans Display, sans-serif',
              margin: 0,
            }}
          >
            СТРАНА
          </motion.h2>
        </Box>

        {/* КУСТОДИЯ */}
        <Box
          sx={{
            position: 'absolute',
            top: isVertical ? '14%' : '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: -500 }}
            animate={{ opacity: 1, y: -20 }}
            transition={{ duration: 1 }}
            style={{
              fontSize: isVertical ? '6.5rem' : '9rem',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#1a727c',
              fontFamily: 'SB Sans Display, sans-serif',
              margin: 0,
            }}
          >
            КУСТОДИЯ
          </motion.h1>
        </Box>

        {/* ЖДЁТ ГОСТЕЙ! */}
        <Box
          sx={{
            position: 'absolute',
            top: isVertical ? '60%' : '55%',
            left: isVertical ? '30%' : '35%',
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -2000 }}
            animate={{ opacity: 1, y: -770, x: 65 }}
            transition={{ duration: 1.4 }}
            style={{
              fontSize: isVertical ? '3.7rem' : '4.5rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#1a727c',
              fontFamily: 'SB Sans Display, sans-serif',
              margin: 0,
            }}
          >
            ЖДЁТ ГОСТЕЙ!
          </motion.h2>
        </Box>

        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 270, opacity: 1 }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
          style={{ width: '100%', fontFamily: 'SB Sans Display, sans-serif', }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: isVertical ? '3rem' : '1.5rem',
              textAlign: 'center',
              fontWeight: 600,
              fontFamily: 'SB Sans Display, sans-serif',
            }}
          >
            Добро пожаловать в фотозону!
            <br />
            Здесь Вы можете стать частью живописного пространства,
            созданного великим художником!
          </Typography>
        </motion.div>
      </Box>
      {/* Нижний блок — либо кнопка, либо лоадер */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 'auto',
          mb: isVertical ? '6rem' : '2rem',
          fontFamily: 'SB Sans Display, sans-serif',
          '@keyframes fadeInScale': {
            '0%': {
              opacity: 0.5,
              transform: 'scale(0)',
            },
            '100%': {
              opacity: 0.7, // ← вот здесь она только "становится" видимой и полупрозрачной
              visibility: 'visible',
              transform: 'scale(1)',
            },
          },
        }}
      >
        {connected ? (
          <Button
            variant="contained"
            onClick={onStartClick}
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
              width: isVertical ? '100%' : '20%',
              maxWidth: '750px',
              zIndex: 1,
              animation: 'fadeInScale 1s ease-out',
              textTransform: 'capitalize',
            }}
          >
            Начать
          </Button>
        ) : (
          <CircularProgress
            sx={{
              width: isVertical ? '150px !important' : '50px !important',
              height: isVertical ? '150px !important' : '50px !important',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default WelcomePage;
