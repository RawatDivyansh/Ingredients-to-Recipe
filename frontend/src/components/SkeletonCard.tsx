import React from 'react';
import './SkeletonCard.css';

const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-image skeleton-shimmer"></div>
      <div className="skeleton-card-content">
        <div className="skeleton-card-title skeleton-shimmer"></div>
        <div className="skeleton-card-meta">
          <div className="skeleton-card-meta-item skeleton-shimmer"></div>
          <div className="skeleton-card-meta-item skeleton-shimmer"></div>
        </div>
        <div className="skeleton-card-description">
          <div className="skeleton-card-line skeleton-shimmer"></div>
          <div className="skeleton-card-line skeleton-shimmer"></div>
          <div className="skeleton-card-line skeleton-shimmer short"></div>
        </div>
        <div className="skeleton-card-tags">
          <div className="skeleton-card-tag skeleton-shimmer"></div>
          <div className="skeleton-card-tag skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
