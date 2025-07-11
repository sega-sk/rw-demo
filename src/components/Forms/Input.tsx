import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export default function Input({ error, className = '', ariaLabel, ariaDescribedBy, ...props }: InputProps) {
  const baseClasses = 'block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
  const errorClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  return (
    <input
      className={`${baseClasses} ${errorClasses} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={error}
      {...props}
    />
  );
}