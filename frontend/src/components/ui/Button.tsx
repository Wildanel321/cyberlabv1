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
  // Mobile touch target guidelines: 44px min-height for md/lg, active state feedback
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  let variantStyles = 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold focus:ring-cyan-500 shadow-sm border border-cyan-400/40';
  if (variant === 'secondary') {
    variantStyles = 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-750 focus:ring-slate-500';
  } else if (variant === 'outline') {
    variantStyles = 'border border-cyan-600 text-cyan-400 hover:bg-cyan-950/40 focus:ring-cyan-500';
  } else if (variant === 'danger') {
    variantStyles = 'bg-rose-700 hover:bg-rose-600 text-white font-medium focus:ring-rose-500 border border-rose-600/40';
  } else if (variant === 'ghost') {
    variantStyles = 'text-slate-300 hover:text-white hover:bg-slate-800/60 focus:ring-slate-600';
  }

  let sizeStyles = 'min-h-[44px] px-4 py-2 text-sm';
  if (size === 'sm') sizeStyles = 'min-h-[36px] sm:min-h-[32px] px-3 py-1.5 text-xs';
  if (size === 'lg') sizeStyles = 'min-h-[48px] px-6 py-3 text-base font-semibold';

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
