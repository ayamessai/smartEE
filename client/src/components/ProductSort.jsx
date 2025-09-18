import { useTranslation } from 'react-i18next';

export default function ProductSort({ sortBy, sortOrder, onSortChange, totalProducts }) {
  const { t } = useTranslation();

  const handleSortChange = (field) => {
    let newOrder = 'desc';
    
    // If clicking the same field, toggle order
    if (sortBy === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    onSortChange(field, newOrder);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="sort-section">
      <div className="card">
        <div className="card-body">
          <div className="sort-header">
            <div className="results-count">
              <span>{t('showing')} <strong>{totalProducts}</strong> {t('products')}</span>
            </div>
            
            <div className="sort-controls">
              <span className="sort-label">{t('sortBy')}:</span>
              
              {/* Sort by Energy Efficiency (Most Important for Economy) */}
              <button
                onClick={() => handleSortChange('energy')}
                className={`btn ${sortBy === 'energy' ? 'btn-success' : 'btn-secondary'}`}
              >
                {t('energyEfficiency')} {getSortIcon('energy')}
              </button>

              {/* Sort by Price */}
              <button
                onClick={() => handleSortChange('price')}
                className={`btn ${sortBy === 'price' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t('price')} {getSortIcon('price')}
              </button>

              {/* Sort by Newest */}
              <button
                onClick={() => handleSortChange('createdAt')}
                className={`btn ${sortBy === 'createdAt' ? 'btn-info' : 'btn-secondary'}`}
              >
                {t('newest')} {getSortIcon('createdAt')}
              </button>
            </div>
          </div>

          {/* Energy Efficiency Info */}
          <div className="energy-info">
            <div className="energy-legend">
              <div className="legend-item">
                <span className="legend-color legend-green"></span>
                <span>{t('mostEfficient')} (A+++)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color legend-yellow"></span>
                <span>{t('efficient')} (A+, A)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color legend-red"></span>
                <span>{t('lessEfficient')} (B, C)</span>
              </div>
            </div>
            <p className="energy-tip">
              💡 {t('energyEfficiencyTip')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
