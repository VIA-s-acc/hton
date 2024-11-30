import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { fetchCategories, addTransaction, deleteTransaction, fetchTransactions, updateTransaction } from '../api'; 
import './css/TransactionForm.css'; // Assuming you have a CSS file for styling

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
  const [isEditing, setIsEditing] = useState(false); 
  const [currentTransactionId, setCurrentTransactionId] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [showAddForm, setShowAddForm] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5; // Adjust based on your requirements

  const token = localStorage.getItem('token');

  // Fetch categories on component load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories(token);
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

  // Fetch transactions on component load
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const data = await fetchTransactions(token);
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };
    if (token) getTransactions();
  }, [token]);

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
    if (isEditing) {
      try {
        await updateTransaction(currentTransactionId, formData, token);
        const data = await fetchTransactions(token);
        setTransactions(data);
        resetFormState();
        setIsEditing(false);
        setShowModal(false);
        setShowAddForm(true);
      } catch (error) {
        console.error('Error updating transaction:', error);
        setError('Error updating transaction. Please try again.');
      }
    } else {
      try {
        await addTransaction(formData, token);
        const data = await fetchTransactions(token);
        setTransactions(data);
        resetFormState();
      } catch (error) {
        console.error('Error adding transaction:', error);
        setError('Error adding transaction. Please try again.');
      }
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deleteTransaction(transactionId, token);
      setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
      resetFormState();
      setIsEditing(false);
      setShowModal(false);
    } catch (err) {
      setError('Error deleting transaction. Please try again.');
    }
  };

  const handleEditTransaction = (transaction) => {
    setFormData({
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      category_id: transaction.category_id,
    });
    setSelectedCategory({
      value: transaction.category_id,
      label: transaction.category_name,
    });
    setIsEditing(true);
    setCurrentTransactionId(transaction.id);
    setShowModal(true);  // Show modal when editing
  };

  const closeModal = () => {
    setShowModal(false);
    resetFormState();
  };

  const resetFormState = () => {
    setFormData({
      amount: '',
      description: '',
      type: 'income',
      category_id: '',
    });
    setSelectedCategory(null);
    setError('');
    setIsEditing(false);
    // setShowAddForm(true);
  };

  const convertToLocalTime = (gmtDateString) => {
    // Преобразуем строку в объект Date (предполагаем, что входная строка в формате ISO 8601)
    const gmtDate = new Date(gmtDateString);
    
    // Конвертируем в локальное время с использованием toLocaleString() или toLocaleTimeString()
    return gmtDate.toLocaleString(); // Это вернёт дату и время в локальной временной зоне пользователя
  };
  

  // Pagination Logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  return (
    <div className="transaction-page">
      <h1>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h1>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Amount"
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Transaction Type:</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <Select
            options={categories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Select Category"
            isClearable
            className="select-field"
          />

          <button type="submit" className="submit-btn">{isEditing ? 'Update Transaction' : 'Add Transaction'}</button>
        </form>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <form onSubmit={handleSubmit} className="transaction-form">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                required
                className="input-field"
              />
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="input-field"
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <Select
                options={categories}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder="Select Category"
                isClearable
                className="select-field"
              />

              <button type="submit" className="submit-btn">{isEditing ? 'Update Transaction' : 'Add Transaction'}</button><br />
              <dir></dir>
              {isEditing && (
                <button type="submit" onClick={() => handleDeleteTransaction(currentTransactionId)} className="submit-btn" style ={{ backgroundColor: '#FF5555' }}>
                  Delete Transaction
                </button>
              )}
            </form>
            <button onClick={closeModal} className="close-btn">Close</button>
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <div className="transaction-list">
        {currentTransactions.map((transaction) => (
          <div key={transaction.id} className="transaction-card">
            <div className="transaction-info">
  
              <h3> {transaction.description} </h3>
              <strong>Amount:</strong> {transaction.amount}<br />

              <strong>Type:</strong> {transaction.type}<br />
              <strong>Category:</strong> {transaction.category_name}<br />
            </div>
            <button className="submit-btn"  onClick={() => handleEditTransaction(transaction)}>Edit</button>
            <div style={{
              bottom: '10px',
              right: '100x',
              fontSize: '6px',
              color: '#888'
            }}>
              <small>Created At: {convertToLocalTime(transaction.created_at)}</small><br />
              <small>Updated At: {convertToLocalTime(transaction.date)}</small>
            </div>
          </div>
        ))}
        
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransactionForm;
