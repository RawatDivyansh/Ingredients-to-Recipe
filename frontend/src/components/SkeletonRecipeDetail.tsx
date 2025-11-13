import React from 'react';
import './SkeletonRecipeDetail.css';

const SkeletonRecipeDetail: React.FC = () => {
  return (
    <div className="skeleton-recipe-detail">
      <div className="skeleton-back-button skeleton-shimmer"></div>
      
      <div className="skeleton-recipe-header">
        <div className="skeleton-recipe-image skeleton-shimmer"></div>
        <div className="skeleton-recipe-title-section">
          <div className="skeleton-recipe-name skeleton-shimmer"></div>
          <div className="skeleton-recipe-description">
            <div className="skeleton-line skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-shimmer short"></div>
          </div>
        </div>
      </div>

      <div className="skeleton-recipe-metadata">
        <div className="skeleton-metadata-item skeleton-shimmer"></div>
        <div className="skeleton-metadata-item skeleton-shimmer"></div>
        <div className="skeleton-metadata-item skeleton-shimmer"></div>
      </div>

      <div className="skeleton-dietary-tags">
        <div className="skeleton-tag skeleton-shimmer"></div>
        <div className="skeleton-tag skeleton-shimmer"></div>
      </div>

      <div className="skeleton-recipe-actions">
        <div className="skeleton-action-button skeleton-shimmer"></div>
        <div className="skeleton-action-button skeleton-shimmer"></div>
      </div>

      <div className="skeleton-recipe-content">
        <div className="skeleton-ingredients">
          <div className="skeleton-section-title skeleton-shimmer"></div>
          <div className="skeleton-ingredient-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-ingredient-item skeleton-shimmer"></div>
            ))}
          </div>
        </div>

        <div className="skeleton-instructions">
          <div className="skeleton-section-title skeleton-shimmer"></div>
          <div className="skeleton-instruction-list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-instruction-item">
                <div className="skeleton-step-number skeleton-shimmer"></div>
                <div className="skeleton-step-text">
                  <div className="skeleton-line skeleton-shimmer"></div>
                  <div className="skeleton-line skeleton-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonRecipeDetail;
