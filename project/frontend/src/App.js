import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';  // Импорт Navigate для редиректа
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
// import TransactionPage from './pages/TransactionPage';
import TransactionForm from './components/TransactionForm';
import CategoryPage from './pages/CategoryPage';
import LogoutPage from './pages/LogoutPage';

function App() {
  const isAuthenticated = localStorage.getItem('token'); // Проверка авторизации (используем token из localStorage)

  return (
    <div>
      <nav>
        <Link to="/">Home</Link> 
        {!isAuthenticated && <Link to="/register">Register</Link>} {/* Показываем регистрацию только если не авторизован */}
        {!isAuthenticated && <Link to="/login">Login</Link>} {/* Показываем вход только если не авторизован */}
        {isAuthenticated && <Link to="/logout">Logout</Link>} {/* Показываем выход только если авторизован */}
        {isAuthenticated && <Link to="/transactions">Manage Transactions</Link>} {/* Добавляем транзакцию только для авторизованных */}
        {isAuthenticated && <Link to="/categories">Manage Categories</Link>} {/* Управление категориями только для авторизованных */}
      </nav>

      <Routes>
        {/* Страница, доступная всем, включая неавторизованных пользователей */}
        <Route path="/" element={<HomePage />} />
        
        {/* Страница регистрации */}
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/register" />} />
        
        {/* Страница входа */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/login" />} />

        <Route path="/logout" element = {isAuthenticated ? <LogoutPage /> : <Navigate to="/logout" />} />

        {/* Добавление транзакции - доступно только для авторизованных */}
        <Route path="/transactions" element={isAuthenticated ? <TransactionForm /> : <Navigate to="/transactions" />} />
        
        {/* Управление категориями - доступно только для авторизованных */}
        <Route path="/categories" element={isAuthenticated ? <CategoryPage /> : <Navigate to="/categories" />} />
      </Routes>
    </div>
  );
}

export default App;
