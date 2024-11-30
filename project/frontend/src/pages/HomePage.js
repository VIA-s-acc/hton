import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css'; // Стили для слайдера
import 'slick-carousel/slick/slick-theme.css'; // Тема для слайдера
import './css/Home.css'; // Импортируем файл стилей

// Настройка слайдера
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

const HomePage = () => {
  const isAuthenticated = localStorage.getItem('token');

  return (
    <div className="container">
      <h1 className="header">
        Welcome to the <span className="highlight">Financial Manager</span>
      </h1>
      
      <div className="message">
        {!isAuthenticated ? (
          <p>Please register or log in to manage your transactions.</p>
        ) : (
          <p>Welcome back! You can now add transactions or manage categories.</p>
        )}
      </div>

      <div className="slider-wrapper">
        <Slider {...sliderSettings}>
          <div className="slide">
            <img className="slide-image" src="https://cdn.gamma.app/0q3g4oyj66epq7o/generated-images/7imQ8avwIbxIz5eUKAejb.jpg" alt="Financial Planning" />
            <div className="slide-text">Manage your expenses and income easily!</div>
          </div>
          <div className="slide">
            <img className="slide-image" src="https://cdn.gamma.app/0q3g4oyj66epq7o/generated-images/b2tiZUPEgMEQslDGV3Opt.jpg" alt="Budgeting" />
            <div className="slide-text">Track your spending with detailed categories.</div>
          </div>
          <div className="slide">
            <img className="slide-image" src="https://cdn.gamma.app/0q3g4oyj66epq7o/generated-images/cIu7VkXbt543rb1jLLBA-.jpg" alt="Financial Freedom" />
            <div className="slide-text">Achieve financial freedom with smart management.</div>
          </div>
        </Slider>
      </div>

      <nav className="nav">
        {!isAuthenticated ? (
          <ul className="nav-list">
            <li className="nav-item"><Link className="styled-link" to="/register">Register</Link></li>
            <li className="nav-item"><Link className="styled-link" to="/login">Login</Link></li>
          </ul>
        ) : (
          <ul className="nav-list">
            <li className="nav-item"><Link className="styled-link" to="/transactions">Manage Transactions</Link></li>
            <li className="nav-item"><Link className="styled-link" to="/categories">Manage Categories</Link></li>
          </ul>
        )}
      </nav>
    </div>
  );
};

export default HomePage;
