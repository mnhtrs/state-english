import React, { type InputHTMLAttributes, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string; // FA icon class, e.g. "fa-solid fa-user"
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', id, name, ...props }) => {
  const reactId = useId();
  const inputId = id || reactId;
  const inputName = name || inputId;

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.45rem',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {icon && <i className={icon} style={{ fontSize: '0.8rem', color: 'var(--accent)' }} />}
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={inputName}
        className={`input ${className}`}
        {...props}
      />
      {error && (
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: 'var(--danger)',
          fontSize: '0.8rem',
          marginTop: '0.35rem',
        }}>
          <i className="fa-solid fa-triangle-exclamation" />
          {error}
        </span>
      )}
    </div>
  );
};
