import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';

interface ProgressBarProps {
  totalDays: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalDays }) => {
  const { t } = useLanguage();
  const limit = 183;
  const percentage = Math.min((totalDays / limit) * 100, 100);

  const getStatus = () => {
    if (totalDays > limit) return { text: 'text-red-400', fill: 'bg-gradient-to-r from-red-500 via-rose-500 to-red-400', glow: 'rgba(239,68,68,0.35)', label: t('progress.over') };
    if (totalDays > 150) return { text: 'text-amber-300', fill: 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300', glow: 'rgba(251,191,36,0.35)', label: t('progress.approaching') };
    return { text: 'text-[var(--app-text-accent,#CD7F32)]', fill: 'bg-gradient-to-r from-[#CD7F32] via-[#E3A34C] to-[#F0C27B]', glow: 'rgba(205,127,50,0.35)', label: t('progress.safe') };
  };

  const status = getStatus();
  const visualWidth = totalDays === 0 ? '0%' : `max(${percentage}%, 12px)`;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-1">{t('progress.title')}</p>
          <p className="text-4xl font-light font-display flex items-baseline gap-2">
            <span className={status.text}>
              {totalDays}
            </span>
            <span className="text-sm opacity-60 font-sans font-normal tracking-widest uppercase">/ {limit} {t('dateSelector.days')}</span>
          </p>
        </div>
        <div className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${status.text}`}>
          {status.label}
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-full border border-white/15 bg-white/6 p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)]" />
          {totalDays > 0 && (
            <>
              <div
                className={`absolute inset-y-[2px] left-[2px] rounded-full ${status.fill} transition-all duration-1000 ease-out`}
                style={{ width: visualWidth, boxShadow: `0 0 20px ${status.glow}` }}
              />
              <div
                className="pointer-events-none absolute inset-y-[2px] left-[2px] rounded-full bg-gradient-to-r from-white/25 via-transparent to-transparent opacity-60 transition-all duration-1000 ease-out"
                style={{ width: visualWidth }}
              />
            </>
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[var(--app-text-muted,rgba(240,237,232,0.45))]">
          <span>0</span>
          <span>183</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
