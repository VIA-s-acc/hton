import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { fetchCategories, addTransaction, deleteTransaction, fetchTransactions } from '../api';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'income',
    category_id: '',
  });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('token');

  // Загружаем категории с сервера при загрузке компонента
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories(token); // Получение категорий с сервера
        const categoryOptions = data.map((category) => ({
          value: category.id,
          label: category.name,
        }));
        setCategories(categoryOptions);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    if (token) loadCategories();
  }, [token]);

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const data = await fetchTransactions(token);
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    if (token) {
      getTransactions();
    }
  }, [token]);

  // Обновляем состояние формы при выборе категории
  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    setFormData((prev) => ({
      ...prev,
      category_id: selectedOption?.value || '',
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTransaction(formData, token);
      // navigate('/'); // Возвращаемся на главную страницу после добавления транзакции
      const data = await fetchTransactions(token);
      setTransactions(data);

    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deleteTransaction(transactionId, token);
      setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
      setError('');
    } catch (err) {
      setError('Error deleting transaction. Please try again.');
    }
  };

  return (
    <div>
      <h1>Add Transaction</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Выпадающий список категорий */}
        <Select
          options={categories} // Передаем данные категорий в React Select
          value={selectedCategory} // Текущая выбранная категория
          onChange={handleCategoryChange} // Обработчик выбора категории
          placeholder="Select Category"
          isClearable // Возможность очистки поля
        />

        <button type="submit">Add Transaction</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            ID: {transaction.id}, Amount: {transaction.amount}, Description: {transaction.description}, Type: {transaction.type}, Category: {transaction.category_name}, Date: {transaction.date}
            <button onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionForm;
