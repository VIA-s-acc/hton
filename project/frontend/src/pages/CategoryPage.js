import React, { useState, useEffect } from 'react';
import { fetchCategories, addCategory, deleteCategory } from '../api'; // Предположим, что addCategory уже настроено в api.js

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const getCategories = async () => {
      const data = await fetchCategories(token);
      setCategories(data);
    };
    if (token) {
      getCategories();
    }
  }, [token]);

  // Функция для обновления состояния формы (имя категории)
  const handleCategoryChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      name: e.target.value,
    }));
  };

  // Функция для обновления состояния формы (описание категории)
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
      const dataFetch = await fetchCategories(token);
      setCategories(dataFetch);
    } catch (error) {
      setError('Failed to delete category. Please try again.');
    }
  }

  // Функция для обработки отправки формы
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.name.trim() === '') {
        setError('Category name cannot be empty');
        return;
      }
  
      const categoryData = {
        name: formData.name,
        description: formData.description,
        // Если нужно, можно добавить user_id
      };
  
      const data = await addCategory(categoryData, token);  // Отправляем данные на сервер
      setCategories((prevCategories) => [...prevCategories, data]); // Добавляем новую категорию в список
      setFormData({ name: '', description: '' }); // Очистка полей ввода
      setError('');
      const dataFetch = await fetchCategories(token);
      setCategories(dataFetch); // Обновляем список категорий
    } catch (err) {
      setError('Failed to add category. Please try again.');
    }
  };

  return (
    <div>
      <h1>Manage Categories</h1>

      {/* Форма для добавления новой категории */}
      <form onSubmit={handleCategorySubmit}>
        <div>
          <label htmlFor="category">New Category:</label>
          <input
            type="text"
            id="category"
            value={formData.name}
            onChange={handleCategoryChange}
            placeholder="Enter category name"
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Enter category description"
          />
        </div>
        <button type="submit">Add Category</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Ошибка при добавлении категории */}

      {/* Список категорий */}
      <ul>
        {categories
          .filter((category) => category.id && category.name && category.description)
          .map((category) => (
            <li key={category.id}>
              ID: {category.id}, Name: {category.name}, Description: {category.description}
              {category.user_id && (
                <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CategoryPage;
