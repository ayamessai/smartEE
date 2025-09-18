import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ProductFilters({ appliedFilters, onFilterChange, onClearFilters }) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState({
    category: '',
    priceRange: '',
    energyClass: ''
  });

  const [categories, setCategories] = useState([]);

  // ✅ Fetch categories from backend
  useEffect(() => {
    fetch('http://localhost:4000/api/products/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
      });
  }, []);

  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { category: '', priceRange: '', energyClass: '' };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(appliedFilters).some(v => v && v !== '');

  const priceRanges = [
    { value: '0-50000', label: `< 50,000 DZD` },
    { value: '50000-100000', label: `50,000 - 100,000 DZD` },
    { value: '100000+', label: `> 100,000 DZD` }
  ];

  const energyClasses = ['A+++', 'A++', 'A+', 'A'];

  return (
    <div className="filters-section">
      <div className="card">
        <div className="card-header">
          <h3>{t('filterProducts')}</h3>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
              {t('clearAllFilters')}
            </button>
          )}
        </div>

        <div className="card-body filter-grid horizontal">
        {/* Category filter */}
        <div className="filter-step">
            <label>{t('selectProductCategory')}</label>
            <select
            value={localFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            >
            <option value="">{t('allCategories')}</option>
            {categories.map(category => (
                <option key={category} value={category}>
                {t(category)}
                </option>
            ))}
            </select>
        </div>

        {/* Price range filter */}
        <div className="filter-step">
            <label>{t('selectPriceRange')}</label>
            <select
            value={localFilters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
            <option value="">{t('Prix')}</option>
            {priceRanges.map(range => (
                <option key={range.value} value={range.value}>
                {range.label}
                </option>
            ))}
            </select>
        </div>

        {/* Energy class filter */}
        <div className="filter-step">
            <label>{t('selectEnergyClass')}</label>
            <select
            value={localFilters.energyClass}
            onChange={(e) => handleFilterChange('energyClass', e.target.value)}
            >
            <option value="">{t('allEnergyClasses')}</option>
            {energyClasses.map(energyClass => (
                <option key={energyClass} value={energyClass}>
                {energyClass}
                </option>
            ))}
            </select>
        </div>
        </div>

      </div>
    </div>
  );
}
