import React from 'react';
import AnimatedTooltip from './AnimatedTooltip';
import './HelpIcon.css';

export interface HelpIconProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  pulse?: boolean;
  size?: 'small' | 'medium' | 'large';
  ariaLabel?: string;
}

const HelpIcon: React.FC<HelpIconProps> = ({
  content,
  position = 'top',
  pulse = true,
  size = 'medium',
  ariaLabel = 'Help information',
}) => {
  return (
    <AnimatedTooltip content={content} position={position}>
      <button
        className={`help-icon help-icon--${size} ${pulse ? 'help-icon--pulse' : ''}`}
        aria-label={ariaLabel}
        type="button"
      >
        <svg
          className="help-icon__svg"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 16V16.01M12 13C12 11.8954 12.8954 11 14 11C15.1046 11 16 10.1046 16 9C16 7.89543 15.1046 7 14 7C12.8954 7 12 7.89543 12 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </AnimatedTooltip>
  );
};

export default HelpIcon;
