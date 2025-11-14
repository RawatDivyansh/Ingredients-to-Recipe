import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './FilterTransition.css';

interface FilterTransitionProps {
  children: React.ReactNode;
  itemKey: string | number;
  timeout?: number;
  className?: string;
}

/**
 * FilterTransition component for smooth grid rearrangement when filters change
 * 
 * @param children - Content to be transitioned
 * @param itemKey - Unique key for the item
 * @param timeout - Duration of transition in milliseconds (default: 400)
 * @param className - Additional CSS classes
 */
export const FilterTransition: React.FC<FilterTransitionProps> = ({
  children,
  itemKey,
  timeout = 400,
  className = '',
}) => {
  const nodeRef = React.useRef(null);

  return (
    <CSSTransition
      key={itemKey}
      nodeRef={nodeRef}
      timeout={timeout}
      classNames="filter-transition"
      unmountOnExit
    >
      <div ref={nodeRef} className={`filter-transition-item ${className}`}>
        {children}
      </div>
    </CSSTransition>
  );
};

interface FilterTransitionGroupProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FilterTransitionGroup wrapper for managing multiple FilterTransition items
 * 
 * @param children - FilterTransition items
 * @param className - Additional CSS classes for the group container
 */
export const FilterTransitionGroup: React.FC<FilterTransitionGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <TransitionGroup className={`filter-transition-group ${className}`}>
      {children}
    </TransitionGroup>
  );
};

export default FilterTransition;
