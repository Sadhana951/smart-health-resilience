import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'red' | 'amber' | 'green' | 'none';
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
  hoverEffect = true
}) => {
  const glowClasses = {
    none: 'border-slate-800/80 bg-background-panel/60',
    cyan: 'border-cyan-500/30 bg-background-panel/70 shadow-glow-cyan',
    red: 'border-rose-500/40 bg-background-panel/75 shadow-glow-red',
    amber: 'border-amber-500/40 bg-background-panel/75 shadow-glow-amber',
    green: 'border-emerald-500/30 bg-background-panel/70 shadow-glow-green'
  };

  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'relative rounded-xl border backdrop-blur-md transition-all duration-300',
          glowClasses[glow],
          hoverEffect && 'hover:border-cyan-400/50 hover:bg-background-hover/80 hover:shadow-lg',
          onClick && 'cursor-pointer',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
