import React, { useState, useRef, useEffect } from 'react';
import './CollapsibleSection.css';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: string;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`collapsible-section ${className} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="collapsible-header touch-target touch-feedback"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls={`collapsible-content-${title}`}
      >
        <div className="collapsible-title">
          {icon && <span className="collapsible-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <span className={`collapsible-chevron ${isExpanded ? 'rotated' : ''}`}>
          ▼
        </span>
      </button>
      
      <div
        id={`collapsible-content-${title}`}
        className="collapsible-content"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '0px',
        }}
        aria-hidden={!isExpanded}
      >
        <div ref={contentRef} className="collapsible-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
