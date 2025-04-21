import React from 'react';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    >
      {/* Анимация текста сверху */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 800, opacity: 1 }}
        transition={{
          duration: 1,
          ease: 'easeOut',
        }}
        style={{ width: '100%' }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign={'center'}
          flex={1}
          mt={-6}
          width="100%"
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              px: 3,
              fontSize: isVertical ? '2.5rem' : '1.75rem',
              wordBreak: 'break-word',
              maxWidth: '750px',
            }}
          >
            Вы должны согласиться с условиями перед продолжением.
          </Typography>
        </Box>
      </motion.div>

      {/* Кнопки снизу с плавной анимацией */}
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: -50, x: -15 ,opacity: 1 }}
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
          }}
        >
          <Button
            onClick={handleAgree}
            variant="contained"
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
              width: '100%',
              maxWidth: '750px',
              opacity: 0.5,
              whiteSpace: 'nowrap',
              textAlign: 'center',
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
            }}
          >
            Не принимаю
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
};

export default WarningPage;
