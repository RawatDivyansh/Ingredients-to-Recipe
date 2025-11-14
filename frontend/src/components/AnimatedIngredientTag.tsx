import React from 'react';
import './AnimatedIngredientTag.css';

interface AnimatedIngredientTagProps {
  ingredient: string;
  category?: string;
  onRemove: (ingredient: string) => void;
  index: number;
}

// Category color mapping system
const getCategoryGradient = (category?: string): string => {
  const categoryMap: { [key: string]: string } = {
    protein: 'var(--gradient-protein)',
    meat: 'var(--gradient-protein)',
    chicken: 'var(--gradient-protein)',
    beef: 'var(--gradient-protein)',
    pork: 'var(--gradient-protein)',
    fish: 'var(--gradient-protein)',
    seafood: 'var(--gradient-protein)',
    
    vegetable: 'var(--gradient-vegetable)',
    vegetables: 'var(--gradient-vegetable)',
    veggie: 'var(--gradient-vegetable)',
    greens: 'var(--gradient-vegetable)',
    
    grain: 'var(--gradient-grain)',
    grains: 'var(--gradient-grain)',
    rice: 'var(--gradient-grain)',
    pasta: 'var(--gradient-grain)',
    bread: 'var(--gradient-grain)',
    
    dairy: 'var(--gradient-dairy)',
    cheese: 'var(--gradient-dairy)',
    milk: 'var(--gradient-dairy)',
    cream: 'var(--gradient-dairy)',
    
    spice: 'var(--gradient-spice)',
    spices: 'var(--gradient-spice)',
    herb: 'var(--gradient-spice)',
    herbs: 'var(--gradient-spice)',
    seasoning: 'var(--gradient-spice)',
  };

  if (!category) {
    return 'var(--gradient-default)';
  }

  const normalizedCategory = category.toLowerCase().trim();
  return categoryMap[normalizedCategory] || 'var(--gradient-default)';
};

const AnimatedIngredientTag: React.FC<AnimatedIngredientTagProps> = ({
  ingredient,
  category,
  onRemove,
  index,
}) => {
  const gradient = getCategoryGradient(category);

  return (
    <div
      className="animated-ingredient-tag touch-feedback"
      style={{
        background: gradient,
        animationDelay: `${index * 50}ms`,
      }}
    >
      <span className="tag-ingredient-name">{ingredient}</span>
      <button
        className="tag-remove-button touch-target"
        onClick={() => onRemove(ingredient)}
        aria-label={`Remove ${ingredient}`}
        type="button"
      >
        ×
      </button>
    </div>
  );
};

export default AnimatedIngredientTag;
