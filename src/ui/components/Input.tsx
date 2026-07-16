import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <input className={`input ${className}`} {...props} />
      {error && <span style={{ color: 'var(--danger-color)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
};
