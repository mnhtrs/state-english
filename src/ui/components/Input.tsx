import React, { type InputHTMLAttributes, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, name, ...props }) => {
  const reactId = useId();
  const inputId = id || reactId;
  const inputName = name || inputId;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label htmlFor={inputId} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <input id={inputId} name={inputName} className={`input ${className}`} {...props} />
      {error && <span style={{ color: 'var(--danger-color)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
};
