import React from 'react';
import './AnimatedEmptyState.css';

interface AnimatedEmptyStateProps {
  /** Emoji or icon to display (e.g., "🔍", "🍳") */
  icon: string;
  /** Main title text */
  title: string;
  /** Descriptive message explaining the empty state */
  message: string;
  /** Optional list of helpful suggestions */
  suggestions?: string[];
  /** Optional call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
    ariaLabel?: string;
  };
  /** Optional custom class name */
  className?: string;
}

/**
 * AnimatedEmptyState Component
 * 
 * Displays an engaging empty state with animated illustrations, helpful suggestions,
 * and optional CTA button. Used when no content is available or filters return no results.
 * 
 * Features:
 * - Animated icon with floating effect
 * - Staggered fade-in animations
 * - Helpful suggestions list
 * - Optional CTA button
 * - Fully responsive
 * - Respects prefers-reduced-motion
 * 
 * @example
 * ```tsx
 * <AnimatedEmptyState
 *   icon="🔍"
 *   title="No recipes found"
 *   message="We couldn't find any recipes matching your criteria."
 *   suggestions={[
 *     'Try removing some filters',
 *     'Add more ingredients',
 *     'Try different combinations'
 *   ]}
 *   action={{
 *     label: 'Back to Home',
 *     onClick: () => navigate('/')
 *   }}
 * />
 * ```
 */
const AnimatedEmptyState: React.FC<AnimatedEmptyStateProps> = ({
  icon,
  title,
  message,
  suggestions,
  action,
  className = '',
}) => {
  return (
    <div className={`animated-empty-state ${className}`.trim()} role="status" aria-live="polite">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-message">{message}</p>
      
      {suggestions && suggestions.length > 0 && (
        <div className="empty-state-suggestions">
          <p className="suggestions-header">Try:</p>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                className="suggestion-item"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {action && (
        <button 
          className="empty-state-action" 
          onClick={action.onClick}
          aria-label={action.ariaLabel || action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default AnimatedEmptyState;
