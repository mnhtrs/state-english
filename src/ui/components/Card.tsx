import React from 'react';
import type { CSSProperties } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
};
