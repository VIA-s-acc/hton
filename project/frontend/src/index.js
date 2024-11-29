import React from 'react';
import ReactDOM from 'react-dom/client'; // Используйте 'react-dom/client' в React 18
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root')); // Создание корня для React 18
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
