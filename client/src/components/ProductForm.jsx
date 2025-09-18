import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function ProductForm({ onSubmit, initialData = null, mode = 'create' }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    if (initialData) {
      setFormData(initialData);
      setSelectedCategory(initialData.category || '');
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFormData({ category });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value
        }
      }));
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleArrayInputChange = (field, value) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
    } else {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value.split(',').map(s => s.trim()).filter(Boolean)
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const { key, label, type, required, options } = field;
    const value = key.includes('.') 
      ? key.split('.').reduce((obj, k) => obj?.[k], formData) || ''
      : formData[key] || '';
    
    const error = errors[key];

    switch (type) {
      case 'select':
        return (
          <select
            key={key}
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className={`select ${error ? 'border-red-500' : ''}`}
            required={required}
          >
            <option value="">{t('selectOption')}</option>
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleInputChange(key, e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        );

      case 'tags':
        const tagsValue = Array.isArray(value) ? value.join(', ') : '';
        return (
          <input
            key={key}
            type="text"
            value={tagsValue}
            onChange={(e) => handleArrayInputChange(key, e.target.value)}
            placeholder={t('commaSeparated')}
            className={`input ${error ? 'border-red-500' : ''}`}
          />
        );

      case 'number':
        return (
          <input
            key={key}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || null)}
            placeholder={label}
            className={`input ${error ? 'border-red-500' : ''}`}
            required={required}
            step="0.1"
          />
        );

      default:
        return (
          <input
            key={key}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder={label}
            className={`input ${error ? 'border-red-500' : ''}`}
            required={required}
          />
        );
    }
  };

  if (!selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">{t('selectProductCategory')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categories).map(([key, category]) => (
            <div
              key={key}
              onClick={() => handleCategoryChange(key)}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="card-body text-center">
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600">{t('clickToSelect')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const category = categories[selectedCategory];
  if (!category) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('addProduct')} - {category.name}</h2>
        <button
          onClick={() => setSelectedCategory('')}
          className="btn btn-outline btn-sm"
        >
          {t('changeCategory')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {category.fields.map(field => (
            <div key={field.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {errors[field.key] && (
                <p className="text-sm text-red-600">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className="btn btn-outline"
            disabled={loading}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('saving') : mode === 'create' ? t('createProduct') : t('updateProduct')}
          </button>
        </div>
      </form>
    </div>
  );
}
