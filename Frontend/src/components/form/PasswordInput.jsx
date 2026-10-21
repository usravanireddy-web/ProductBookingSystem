import { useState } from 'react';

export function PasswordInput({ value, onChange, minLength }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-field">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        minLength={minLength}
        required
      />
      <button
        className="eye-button"
        type="button"
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible(!visible)}
      >
        {visible ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.3 4 9.4 6.1a1.9 1.9 0 0 1 0 1.8 16.5 16.5 0 0 1-3.1 3.8M6.6 6.6A16.5 16.5 0 0 0 2.6 10a1.9 1.9 0 0 0 0 1.8C3.7 14 7 18 12 18c1.2 0 2.3-.2 3.3-.6" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.6 10.1C3.7 8 7 4 12 4s8.3 4 9.4 6.1a1.9 1.9 0 0 1 0 1.8C20.3 14 17 18 12 18s-8.3-4-9.4-6.1a1.9 1.9 0 0 1 0-1.8Z" />
            <circle cx="12" cy="11" r="3" />
          </svg>
        )}
      </button>
    </span>
  );
}
