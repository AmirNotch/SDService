import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WelcomePage from './components/WelcomePage';
import GenderSelectionPage from './components/GenderSelectionPage';
import TakePhotoPage from './components/TakePhotoPage';
import WarningDialog from './components/WarningDialog';
import ResultPage from './components/ResultPage';
import WarningPage from './components/WarningPage';
import LoadingPage from "./components/LoadingPage";

import './index.css';
const App: React.FC = () => {
  const isVertical = useMediaQuery('(max-width: 1080px) and (min-height: 1920px)');
  
  const theme = createTheme({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
    typography: {
      fontFamily: 'Arial, sans-serif',
      h4: {
        fontSize: isVertical ? '3rem' : '1.5rem',
      },
      h6: {
        fontSize: isVertical ? '2.5rem' : '1.25rem',
      },
      body1: {
        fontSize: isVertical ? '2rem' : '1rem',
      },
      body2: {
        fontSize: isVertical ? '1.8rem' : '0.875rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: isVertical ? '2.4rem' : '0.875rem',
            padding: isVertical ? '24px 48px' : '6px 12px',
            borderRadius: isVertical ? '20px' : '4px',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            fontSize: isVertical ? '3rem' : '1.5rem',
            padding: isVertical ? '16px' : '8px',
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            width: isVertical ? '120px !important' : '40px !important',
            height: isVertical ? '120px !important' : '40px !important',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            fontSize: isVertical ? '2rem' : '1rem',
            padding: isVertical ? '32px' : '16px',
          },
        },
      },
    },
  });

  const useViewportHeight = () => {
    const [vh, setVh] = useState(window.innerHeight * 0.01);
  
    useEffect(() => {
      const handleResize = () => {
        setVh(window.innerHeight * 0.01);
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return vh;
  };

  const AppContent: React.FC = () => {
    const vh = useViewportHeight();
  
  useEffect(() => {
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, [vh]);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      // Функция для перехода в полноэкранный режим
      const enterFullscreen = () => {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => {
            console.error(`Ошибка при переходе в полноэкранный режим: ${err.message}`);
          });
        }
      };
  
      // Блокировка выхода по ESC
      const blockEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'F11') {
          e.preventDefault();
        }
      };
  
      enterFullscreen();
      document.addEventListener('keydown', blockEscape);
  
      return () => {
        document.removeEventListener('keydown', blockEscape);
      };
    }, []);

    useEffect(() => {
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

    const handleDialogClose = (accepted: boolean) => {
      setWarningDialogOpen(false);
      if (accepted) {
        navigate('/gender');
      }
    };

    const handleStartButtonClick = () => {
      setWarningDialogOpen(true);
    };

    return (
      <Box sx={{
        maxWidth: '100vw',
        overflowX: 'hidden',
        '& .MuiTypography-root, & .MuiButton-root': {
          transition: 'all 0.3s ease',
        }
      }}>
        <Routes>
          <Route path="/" element={<WelcomePage onStartClick={() => navigate('/warning')} />} />
          <Route path="/warning" element={<WarningPage />} />
          <Route path="/gender" element={<GenderSelectionPage />} />
          <Route path="/take-photo" element={<TakePhotoPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
        <WarningDialog open={warningDialogOpen} onClose={handleDialogClose} />
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;