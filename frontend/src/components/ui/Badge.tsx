import React from 'react';
import { RiskTier } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'tier';
  tier?: RiskTier;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  tier,
  className = '',
}) => {
  let badgeStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (tier) {
    switch (tier) {
      case 'LOW':
        badgeStyles = 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
        break;
      case 'MEDIUM':
        badgeStyles = 'bg-amber-950/80 text-amber-400 border-amber-800';
        break;
      case 'HIGH':
        badgeStyles = 'bg-orange-950/80 text-orange-400 border-orange-800';
        break;
      case 'CRITICAL':
        badgeStyles = 'bg-rose-950/80 text-rose-400 border-rose-800 animate-pulse';
        break;
    }
  } else {
    switch (variant) {
      case 'success':
        badgeStyles = 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
        break;
      case 'warning':
        badgeStyles = 'bg-amber-950/80 text-amber-400 border-amber-800';
        break;
      case 'danger':
        badgeStyles = 'bg-rose-950/80 text-rose-400 border-rose-800';
        break;
      case 'info':
        badgeStyles = 'bg-cyan-950/80 text-cyan-400 border-cyan-800';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles} ${className}`}
    >
      {children}
    </span>
  );
};
