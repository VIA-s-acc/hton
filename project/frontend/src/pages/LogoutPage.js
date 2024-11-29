import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Удаление токена из localStorage
    localStorage.removeItem('token');
    
    // Перенаправление пользователя на страницу входа
    navigate('/');
    window.location.reload(); // Обновляем страницу для отображения изменений
  }, [navigate]);

  return (
    <div>
      <h2>Logging out...</h2>
    </div>
  );
};

export default LogoutPage;
