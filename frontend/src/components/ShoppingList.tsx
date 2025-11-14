import React, { useEffect, useState } from 'react';
import { ShoppingListItem } from '../types';
import { userService } from '../services/userService';
import AnimatedEmptyState from './AnimatedEmptyState';
import './ShoppingList.css';

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getShoppingList();
      setItems(response.items);
    } catch (err: any) {
      console.error('Failed to fetch shopping list:', err);
      setError('Failed to load your shopping list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      setRemovingItemId(itemId);
      await userService.removeFromShoppingList(itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (err: any) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemovingItemId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="shopping-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading your shopping list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shopping-list-error">
        <p>{error}</p>
        <button onClick={fetchShoppingList} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <AnimatedEmptyState
        icon="🛒"
        title="Your Shopping List is Empty"
        message="Add missing ingredients from recipes to build your shopping list!"
        suggestions={[
          'View a recipe and click "Add to Shopping List"',
          'Missing ingredients will be automatically added',
          'Check off items as you shop'
        ]}
      />
    );
  }

  return (
    <div className="shopping-list">
      <div className="shopping-list-header">
        <h3>Shopping List ({items.length} {items.length === 1 ? 'item' : 'items'})</h3>
      </div>
      <div className="shopping-list-items">
        {items.map((item) => (
          <div key={item.id} className="shopping-list-item">
            <div className="item-info">
              <span className="item-name">{item.ingredient_name}</span>
              <span className="item-quantity">
                {item.quantity} {item.unit}
              </span>
            </div>
            <button
              className="remove-button"
              onClick={() => handleRemoveItem(item.id)}
              disabled={removingItemId === item.id}
              aria-label={`Remove ${item.ingredient_name}`}
            >
              {removingItemId === item.id ? '...' : '×'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;
