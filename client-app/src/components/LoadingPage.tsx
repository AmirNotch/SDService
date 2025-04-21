import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../LoadingPage.css'; // Для стилей
import ComponentSVG from '../images/Component.svg'; // путь к стрелке

// Импорты для загрузки изображения и обработки
import { uploadImage } from './uploadImage';
import { processImage, ProcessResult } from './processImage';

const LoadingPage = () => {
    const navigate = useNavigate();
    const [imageBlob, setImageBlob] = useState<Blob | null>(null); // Храним изображение
    const [gender, setGender] = useState<string>('male'); // Пример с полом, замените на нужное значение
    const [isLoaded, setIsLoaded] = useState(false); // Состояние для отслеживания завершения анимации

    // Эффект для начала анимации
    useEffect(() => {
        setIsLoaded(true);
        // Задержка перед переходом на другую страницу
        const timer = setTimeout(() => {
            navigate('/result', {
                state: {
                    initialImage: {
                        type: 'image',
                        url: '',  // Заглушка, так как изображение не загружается автоматически
                        filename: '',
                        sessionId: '',
                        error: '',
                    },
                },
            });
        }, 4000); // Переход через 4 секунды

        // Очистка таймера при размонтировании компонента
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="loading-page">
            <div className="spinner-container">
                <img
                    src={ComponentSVG}
                    alt="Loading"
                    className={`spinner ${isLoaded ? 'spin' : ''}`}
                />
            </div>
        </div>
    );
};

export default LoadingPage;
