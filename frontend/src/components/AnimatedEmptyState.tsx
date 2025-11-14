import React from 'react';
import './AnimatedEmptyState.css';

interface AnimatedEmptyStateProps {
  icon: string;
  title: string;
  message: string;
  suggestions?: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AnimatedEmptyState: React.FC<AnimatedEmptyStateProps> = ({
  icon,
  title,
  message,
  suggestions,
  action,
}) => {
  return (
    <div className="animated-empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-message">{message}</p>
      
      {suggestions && suggestions.length > 0 && (
        <div className="empty-state-suggestions">
          <p className="suggestions-header"><strong>Try:</strong></p>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default AnimatedEmptyState;
