import React from 'react';
import './SkeletonLoader.css';

export type SkeletonVariant = 
  | 'text' 
  | 'title' 
  | 'circular' 
  | 'rectangular' 
  | 'card'
  | 'filter-panel'
  | 'button';

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  animation?: 'shimmer' | 'pulse' | 'none';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  className = '',
  animation = 'shimmer'
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return 'skeleton-text';
      case 'title':
        return 'skeleton-title';
      case 'circular':
        return 'skeleton-circular';
      case 'rectangular':
        return 'skeleton-rectangular';
      case 'card':
        return 'skeleton-card-variant';
      case 'filter-panel':
        return 'skeleton-filter-panel-variant';
      case 'button':
        return 'skeleton-button';
      default:
        return 'skeleton-rectangular';
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'shimmer':
        return 'skeleton-shimmer';
      case 'pulse':
        return 'skeleton-pulse';
      case 'none':
        return '';
      default:
        return 'skeleton-shimmer';
    }
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const skeletonElements = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`skeleton-loader ${getVariantClass()} ${getAnimationClass()} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  ));

  return count > 1 ? (
    <div className="skeleton-loader-group">
      {skeletonElements}
    </div>
  ) : (
    <>{skeletonElements}</>
  );
};

export default SkeletonLoader;
