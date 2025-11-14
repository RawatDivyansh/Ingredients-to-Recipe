import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import AnimatedIngredientTag from './AnimatedIngredientTag';
import IngredientEmptyState from './IngredientEmptyState';
import './SelectedIngredientsList.css';

interface SelectedIngredientsListProps {
  ingredients: string[];
  onRemoveIngredient: (ingredient: string) => void;
}

// Simple category detection based on ingredient name
const detectCategory = (ingredient: string): string => {
  const lower = ingredient.toLowerCase();
  
  // Protein/Meat
  if (/(chicken|beef|pork|fish|salmon|tuna|shrimp|turkey|lamb|meat|protein)/i.test(lower)) {
    return 'protein';
  }
  
  // Vegetables
  if (/(tomato|onion|garlic|pepper|carrot|broccoli|spinach|lettuce|cucumber|celery|mushroom|vegetable|veggie)/i.test(lower)) {
    return 'vegetable';
  }
  
  // Grains
  if (/(rice|pasta|bread|flour|wheat|oat|quinoa|barley|grain)/i.test(lower)) {
    return 'grain';
  }
  
  // Dairy
  if (/(cheese|milk|cream|butter|yogurt|dairy)/i.test(lower)) {
    return 'dairy';
  }
  
  // Spices/Herbs
  if (/(salt|pepper|basil|oregano|thyme|rosemary|cumin|paprika|cinnamon|spice|herb)/i.test(lower)) {
    return 'spice';
  }
  
  return 'default';
};

const SelectedIngredientsList: React.FC<SelectedIngredientsListProps> = ({
  ingredients,
  onRemoveIngredient,
}) => {
  if (ingredients.length === 0) {
    return <IngredientEmptyState />;
  }

  return (
    <div className="selected-ingredients-list">
      <h3>Selected Ingredients ({ingredients.length})</h3>
      <TransitionGroup className="ingredients-tags">
        {ingredients.map((ingredient, index) => (
          <CSSTransition
            key={ingredient}
            timeout={300}
            classNames="tag-transition"
          >
            <AnimatedIngredientTag
              ingredient={ingredient}
              category={detectCategory(ingredient)}
              onRemove={onRemoveIngredient}
              index={index}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};

export default SelectedIngredientsList;
