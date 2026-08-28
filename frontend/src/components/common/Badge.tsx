import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variants: Record<BadgeVariant, string> = {
    success: 'bg-[#ECFDF5] text-[#047857] border-[#10B981]/30',
    warning: 'bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/30',
    error: 'bg-[#FEF2F2] text-[#B91C1C] border-[#EF4444]/30',
    danger: 'bg-[#FEF2F2] text-[#B91C1C] border-[#EF4444]/30',
    neutral: 'bg-[#F4F8F7] text-[#034E4E] border-[#DDE5E3]',
    info: 'bg-[#EAF4F3] text-[#034E4E] border-[#0B6868]/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
