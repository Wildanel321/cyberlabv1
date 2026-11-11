import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  let variantStyles = 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50 focus:ring-cyan-500';
  if (variant === 'secondary') {
    variantStyles = 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500';
  } else if (variant === 'outline') {
    variantStyles = 'border border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/40 focus:ring-cyan-500';
  } else if (variant === 'danger') {
    variantStyles = 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 focus:ring-rose-500';
  } else if (variant === 'ghost') {
    variantStyles = 'text-slate-400 hover:text-white hover:bg-slate-800/60 focus:ring-slate-600';
  }

  let sizeStyles = 'px-4 py-2 text-sm';
  if (size === 'sm') sizeStyles = 'px-3 py-1.5 text-xs';
  if (size === 'lg') sizeStyles = 'px-6 py-3 text-base font-semibold';

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
