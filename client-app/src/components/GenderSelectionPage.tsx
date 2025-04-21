import React from 'react';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
        backgroundColor: '#c0ff00',
        px: isVertical ? '6rem' : '2rem',
        py: isVertical ? '4rem' : '2rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Текст — чуть выше центра */}
      <Box sx={{ mt: isVertical ? '10vh' : '6vh' }}>
        <motion.div
          initial={{ y: -300, opacity: 0 }}
          animate={{ y: 100, opacity: 1 }}
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
            }}
          >
            Укажите Ваш пол
          </Typography>
        </motion.div>
      </Box>

      {/* Кнопки — у нижней границы */}
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: -50, x: -15 ,opacity: 1 }}
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
            backgroundColor: '#1a727c',
            border: '6px solid white',
            color: 'white',
            '&:hover': {
              backgroundColor: '#155f68',
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out',
            fontSize: isVertical ? '2rem' : '1.5rem',
            padding: isVertical ? '2rem 4rem' : '1rem 2rem',
            borderRadius: isVertical ? '40px' : '12px',
            width: isVertical ? '100%' : '20%',
            maxWidth: '750px',
            opacity: 0.5,
          }}
        >
          Мужской
        </Button>

        <Button
          variant="contained"
          onClick={() => handleGenderSelect('Женский')}
          sx={{
            backgroundColor: '#1a727c',
            border: '6px solid white',
            color: 'white',
            '&:hover': {
              backgroundColor: '#155f68',
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out',
            fontSize: isVertical ? '2rem' : '1.5rem',
            padding: isVertical ? '2rem 4rem' : '1rem 2rem',
            borderRadius: isVertical ? '40px' : '12px',
            width: isVertical ? '100%' : '20%',
            maxWidth: '750px',
            opacity: 0.5,
          }}
        >
          Женский
        </Button>
      </motion.div>
    </Box>
  );
};

export default GenderSelectionPage;
