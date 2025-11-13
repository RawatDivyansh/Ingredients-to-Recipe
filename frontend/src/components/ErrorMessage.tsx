import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-message">
      <span className="error-message-text">{message}</span>
      {onDismiss && (
        <button 
          className="error-message-dismiss" 
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
