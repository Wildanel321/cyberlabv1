import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', bordered = true }) => {
  return (
    <div
      className={`bg-slate-900 rounded-xl p-4 sm:p-5 transition-colors ${
        bordered ? 'border border-slate-800' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
