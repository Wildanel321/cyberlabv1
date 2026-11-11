import React from 'react';
import { RiskTier } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  tier?: RiskTier;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  tier,
  className = '',
}) => {
  let badgeStyles = 'bg-slate-800 text-slate-200 border-slate-700';

  if (tier) {
    switch (tier) {
      case 'LOW':
        badgeStyles = 'bg-emerald-950 text-emerald-300 border-emerald-800';
        break;
      case 'MEDIUM':
        badgeStyles = 'bg-amber-950 text-amber-300 border-amber-800';
        break;
      case 'HIGH':
        badgeStyles = 'bg-orange-950 text-orange-300 border-orange-800';
        break;
      case 'CRITICAL':
        badgeStyles = 'bg-rose-950 text-rose-200 border-rose-700 font-bold';
        break;
    }
  } else {
    switch (variant) {
      case 'success':
        badgeStyles = 'bg-emerald-950 text-emerald-300 border-emerald-800';
        break;
      case 'warning':
        badgeStyles = 'bg-amber-950 text-amber-300 border-amber-800';
        break;
      case 'danger':
        badgeStyles = 'bg-rose-950 text-rose-200 border-rose-800';
        break;
      case 'info':
        badgeStyles = 'bg-cyan-950 text-cyan-300 border-cyan-800';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${badgeStyles} ${className}`}
    >
      {children}
    </span>
  );
};
