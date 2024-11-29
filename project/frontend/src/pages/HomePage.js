import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const isAuthenticated = localStorage.getItem('token');

  return (
    <div>
      <h1>Welcome to the Financial Manager</h1>
      {!isAuthenticated ? (
        <p>Please register or log in to manage your transactions.</p>
      ) : (
        <p>Welcome back! You can now add transactions or manage categories.</p>
      )}
      <nav>
        {!isAuthenticated ? (
          <ul>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        ) : (
          <ul>
            <li><Link to="/add-transaction">Add Transaction</Link></li>
            <li><Link to="/categories">Manage Categories</Link></li>
          </ul>
        )}
      </nav>
    </div>
  );
};

export default HomePage;
