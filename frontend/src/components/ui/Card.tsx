import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl transition-all duration-200 backdrop-blur-sm ${
        glow ? 'border-cyan-500/40 shadow-cyan-950/40 shadow-lg' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
