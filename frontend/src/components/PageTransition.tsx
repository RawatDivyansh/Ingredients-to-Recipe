import React from 'react';
import { CSSTransition } from 'react-transition-group';
import './PageTransition.css';

export type TransitionType = 'fade' | 'slide' | 'scale';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
  type?: TransitionType;
  timeout?: number;
  unmountOnExit?: boolean;
  appear?: boolean;
}

/**
 * PageTransition wrapper component for smooth transitions between routes, modals, and popups
 * 
 * @param children - Content to be transitioned
 * @param transitionKey - Unique key to trigger transition (typically location.pathname)
 * @param type - Type of transition: 'fade' (default), 'slide', or 'scale'
 * @param timeout - Duration of transition in milliseconds (default: 300)
 * @param unmountOnExit - Whether to unmount component on exit (default: true)
 * @param appear - Whether to run transition on initial mount (default: true)
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionKey,
  type = 'fade',
  timeout = 300,
  unmountOnExit = true,
  appear = true,
}) => {
  const nodeRef = React.useRef(null);

  return (
    <CSSTransition
      key={transitionKey}
      nodeRef={nodeRef}
      timeout={timeout}
      classNames={`page-transition-${type}`}
      unmountOnExit={unmountOnExit}
      appear={appear}
    >
      <div ref={nodeRef} className="page-transition-wrapper">
        {children}
      </div>
    </CSSTransition>
  );
};

export default PageTransition;
