import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './css/RegisterPage.css'; // Подключим CSS файл для стилизации

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    type: 'base',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/register', formData);
      const userData = response.data;
      console.log(userData);

      if (userData.token) {
        // Сохраняем токен
        localStorage.setItem('token', userData.token);

        // Показываем модальное окно благодарности
        Swal.fire({
          title: 'Thank you for registering!',
          text: 'Your account has been successfully created.',
          imageUrl: 'https://cdn.discordapp.com/attachments/1312113618195841077/1312367363223588975/Z.png?ex=674c3cd9&is=674aeb59&hm=1a8f807d77163d8e80f3b1fe27edc8e7e171deacf0b8ac60386450565cdc9aa6&', // Замените на правильный путь к картинке
          imageWidth: 200,
          imageHeight: 200,
          imageAlt: 'Thank you image',
          confirmButtonText: 'Go to Home',
          confirmButtonColor: '#4b3f6b',
        }).then(() => {
          navigate('/'); // Переход на главную страницу
          window.location.reload(); // Обновляем страницу
        });
      }
    } catch (err) {
      const errorResponse = err.response.data;
      setError('Registration failed! Please try again. Reason: ' + errorResponse.msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2 className="register-title">Create Account</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="input-field"
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="input-field"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="input-field"
            />
          </div>
          <button type="submit" className="submit-button">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
