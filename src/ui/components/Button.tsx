import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: string; // FA icon class, e.g. "fa-solid fa-plus"
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {icon && <i className={icon} />}
      {children}
    </button>
  );
};
