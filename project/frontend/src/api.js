import axios from 'axios';

// Создание экземпляра axios
const api = axios.create({
  baseURL: 'http://localhost:5000', // Укажите URL вашего бэкенда
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response, // Пропускаем успешные ответы
  (error) => {
    // Проверяем, истек ли токен
    if (error.response && error.response.status === 401) {
      const errorMsg = error.response.data.msg || '';
      if (errorMsg === 'Token has expired' || errorMsg.includes('expired')) {
        // Если токен истек, удаляем его из localStorage и перенаправляем пользователя
        localStorage.removeItem('token');
        window.location.href = '/login'; // Перенаправляем на страницу входа
      }
    }
    return Promise.reject(error); // Прокидываем ошибку дальше
  }
);

export default api;

// Функции для отправки запросов на сервер
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration Error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const addTransaction = async (transactionData, token) => {
  try {
    const response = await api.post('/transactions', transactionData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Add Transaction Error:', error);
    throw error;
  }
};

export const fetchTransactions = async (token) => {
  try {
    const response = await api.get('/transactions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.map(transaction => ({
      ...transaction,
      category: transaction.category || {} // Добавим категорию, если она есть
    }));
  } catch (error) {
    console.error('Fetch Transactions Error:', error);
    throw error;
  }
};

export const updateTransaction = async (id, updatedData, token) => {
  try {
    const response = await api.put(`/transactions/${id}/update`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Update Transaction Error:', error);
    throw error;
  }
};


export const deleteTransaction = async (transactionId, token) => {
  try {
    const response = await api.delete(`/transactions/${transactionId}/delete`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId, token) => {
  try {
    const response = await api.delete(`/categories/${categoryId}/delete`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Delete Category Error:', error);
    throw error;
  }
};

export const updateCategory = async (id, updatedData, token) => {
  try {
    const response = await api.put(`/categories/${id}/update`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Update Category Error:', error);
    throw error;
  }
};


export const addCategory = async (categoryData, token) => {
  try {
    const response = await api.post('/categories', categoryData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Add Category Error:', error);
    throw error;
  }
};

export const fetchCategories = async (token) => {
  try {
    const response = await api.get('/categories', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch Categories Error:', error);
    throw error;
  }
};
