import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TransactionPage from './pages/TransactionPage';
import CategoryPage from './pages/CategoryPage';
import LogoutPage from './pages/LogoutPage';
import DashboardPage from './pages/DashboardPage';
import styled from 'styled-components';

function App() {
  const isAuthenticated = localStorage.getItem('token'); // Проверка авторизации

  return (
    <AppContainer>
      <Nav>
        <Logo to="/">Financial Manager</Logo>
        <NavLinks>
          <NavLink to="/">Home</NavLink>
          {!isAuthenticated && <NavLink to="/register">Register</NavLink>}
          {!isAuthenticated && <NavLink to="/login">Login</NavLink>}
          {isAuthenticated && <NavLink to="/logout">Logout</NavLink>}
          {isAuthenticated && <NavLink to="/transactions">Manage Transactions</NavLink>}
          {isAuthenticated && <NavLink to="/categories">Manage Categories</NavLink>}
          {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}
        </NavLinks>
      </Nav>

      <MainContent>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/logout" element={isAuthenticated ? <LogoutPage /> : <Navigate to="/" />} />
          <Route path="/transactions" element={isAuthenticated ? <TransactionPage /> : <Navigate to="/login" />} />
          <Route path="/categories" element={isAuthenticated ? <CategoryPage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

// Styled-components для стилизации

const AppContainer = styled.div`
  font-family: 'Arial', sans-serif;
  background-color: #fef0f6; // Светлый розовый фон
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 0 20px;
`;

const Nav = styled.nav`
  width: 100%;
  background-color: #f29eaf; // Мягкий розовый
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  color: #fff;
  font-size: 1.8rem;
  font-weight: bold;
  text-decoration: none;
  &:hover {
    color: #a3c1d1; // Розовый при наведении
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 15px;
`;

const NavLink = styled(Link)`
  color: #fff;
  font-size: 1.1rem;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  &:hover {
    background-color: #a3c1d1; // Розовый при наведении
    color: white;
  }

  &.active {
    background-color: #a3c1d1; // Мягкий розовый для активной ссылки
  }
`;

const MainContent = styled.main`
  width: 100%;
  max-width: 1200px;
  margin-top: 40px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export default App;
