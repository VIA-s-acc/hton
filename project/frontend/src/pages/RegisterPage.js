import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/RegisterPage.css'; // Подключим CSS файл для стилизации

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    type: 'base'
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
        localStorage.setItem('token', userData.token);
        navigate('/'); // Переход на главную страницу
        window.location.reload();
        
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
