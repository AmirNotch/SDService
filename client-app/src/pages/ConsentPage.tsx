// src/pages/ConsentPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConsentPage = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleAgreement = () => {
    setAgreed(true);
    // После согласия, показываем выбор пола
  };

  const handleGenderSelection = (gender: string) => {
    // После выбора пола, переходим на страницу с камерой
    navigate('/take-photo', { state: { gender } });
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h1>Предупреждение об использовании данных</h1>
      <p>Пожалуйста, ознакомьтесь с нашей политикой использования данных...</p>
      <button onClick={handleAgreement}>ОК</button>

      {agreed && (
        <div>
          <h2>Выберите ваш пол</h2>
          <button onClick={() => handleGenderSelection('male')}>Мужской</button>
          <button onClick={() => handleGenderSelection('female')}>Женский</button>
        </div>
      )}
    </div>
  );
};

export default ConsentPage;
