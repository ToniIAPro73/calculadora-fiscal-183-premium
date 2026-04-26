import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  totalDays: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalDays }) => {
  const { t } = useLanguage();
  const limit = 183;
  const percentage = Math.min((totalDays / limit) * 100, 100);

  const getStatus = () => {
    if (totalDays > limit) return { color: 'text-destructive', label: t('progress.over') };
    if (totalDays > 150) return { color: 'text-warning', label: t('progress.approaching') };
    return { color: 'text-success', label: t('progress.safe') };
  };

  const status = getStatus();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-1">{t('progress.title')}</p>
          <p className="text-4xl font-light font-display flex items-baseline gap-2">
            <span className={status.color.includes('success') ? 'text-primary' : status.color.includes('warning') ? 'text-amber-500' : 'text-red-500'}>
              {totalDays}
            </span>
            <span className="text-sm opacity-60 font-sans font-normal tracking-widest uppercase">/ {limit} {t('dateSelector.days')}</span>
          </p>
        </div>
        <div className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accent border border-border ${status.color.includes('success') ? 'text-primary' : status.color.includes('warning') ? 'text-amber-500' : 'text-red-500'}`}>
          {status.label}
        </div>
      </div>
      <div className="relative h-2 w-full bg-accent rounded-full overflow-hidden border border-border/50">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full ${status.color.includes('success') ? 'bg-primary' : status.color.includes('warning') ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
