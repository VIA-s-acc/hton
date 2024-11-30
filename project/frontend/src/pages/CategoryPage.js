import React, { useState, useEffect } from 'react';
import { fetchCategories, addCategory, deleteCategory } from '../api'; // Предположим, что addCategory уже настроено в api.js
import './css/CategoryPage.css'; // Подключаем файл с CSS стилями

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 9; // Устанавливаем на 9 категорий

  useEffect(() => {
    const getCategories = async () => {
      const data = await fetchCategories(token);
      setCategories(data);
    };
    if (token) {
      getCategories();
    }
  }, [token]);

  const handleCategoryChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      name: e.target.value,
    }));
  };

  const handleDescriptionChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      description: e.target.value,
    }));
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId, token);
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
    } catch (error) {
      setError('Failed to delete category. Please try again.');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.name.trim() === '' || formData.description.trim() === '') {
        setError('Category name and description cannot be empty');
        return;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description,
      };

      const data = await addCategory(categoryData, token);  // Отправляем данные на сервер
      setCategories((prevCategories) => [data, ...prevCategories]); // Добавляем новую категорию в начало списка
      setFormData({ name: '', description: '' }); // Очистка полей ввода
      setError('');
      const newCategories = await fetchCategories(token); // Обновляем список категорий после добавления
      setCategories(newCategories);
      
    } catch (err) {
      setError('Failed to add category. Please try again.');
    }
  };

  // Логика для пагинации
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  return (
    <div className="category-page">
      <h1>Manage Categories</h1>

      {/* Форма для добавления новой категории */}
      <form onSubmit={handleCategorySubmit} className="category-form">
        <div className="form-group">
          <label htmlFor="category">New Category:</label>
          <input
            type="text"
            id="category"
            value={formData.name}
            onChange={handleCategoryChange}
            placeholder="Enter category name"
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Enter category description"
            className="input-field"
          />
        </div>
        <button type="submit" className="submit-btn">Add Category</button>
      </form>

      {error && <p className="error-message">{error}</p>}  {/* Ошибка при добавлении категории */}

      {/* Список категорий */}
      <div className="category-list">
        {currentCategories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-info">
              <strong>Name:</strong> {category.name}<br />
              <strong>Description:</strong> {category.description}
            </div>
            {category.user_id && (
              <button
                className="delete-btn"
                onClick={() => handleDeleteCategory(category.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Пагинация */}
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

export default CategoryPage;
