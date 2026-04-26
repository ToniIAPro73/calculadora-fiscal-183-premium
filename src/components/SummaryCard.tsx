import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryCardProps {
  totalDays: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ totalDays }) => {
  const { language } = useLanguage();

  const limit = 183;
  const remaining = Math.max(limit - totalDays, 0);
  const percentage = Math.min((totalDays / limit) * 100, 100);

  const getStatus = () => {
    if (totalDays <= 150) return {
      label: language === 'es' ? 'Seguro' : 'Safe',
      color: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/25',
    };
    if (totalDays <= 183) return {
      label: language === 'es' ? 'Próximo al límite' : 'Near limit',
      color: 'text-amber-400',
      barColor: 'bg-amber-500',
      badgeBg: 'bg-amber-500/10 border-amber-500/25',
    };
    return {
      label: language === 'es' ? 'Límite superado' : 'Over limit',
      color: 'text-red-400',
      barColor: 'bg-red-500',
      badgeBg: 'bg-red-500/10 border-red-500/25',
    };
  };

  const status = getStatus();

  return (
    <Card className="ac-surface-panel--strong overflow-hidden">
      <CardContent className="p-6 space-y-6">

        {/* Eyebrow + title + status badge */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[var(--app-text-accent,#CD7F32)]">
            {language === 'es' ? 'RESIDENCIA FISCAL' : 'FISCAL RESIDENCY'}
          </p>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-display font-semibold text-[var(--app-text-primary,#f0ede8)]">
              {language === 'es' ? 'Resumen' : 'Summary'}
            </h3>
            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.color} ${status.badgeBg}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${status.barColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-right text-[var(--app-text-muted,rgba(240,237,232,0.38))] font-medium">
            {totalDays} / {limit} {language === 'es' ? 'días' : 'days'}
          </p>
        </div>

        {/* Stats — vertical list, no overflow */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between py-2.5 border-b border-white/6">
            <span className="text-xs text-[var(--app-text-muted,rgba(240,237,232,0.38))] font-medium">
              {language === 'es' ? 'Días registrados' : 'Logged days'}
            </span>
            <span className="text-2xl font-bold font-display text-[var(--app-text-primary,#f0ede8)] tabular-nums">
              {totalDays}
            </span>
          </div>
          <div className="flex items-baseline justify-between py-2.5 border-b border-white/6">
            <span className="text-xs text-[var(--app-text-muted,rgba(240,237,232,0.38))] font-medium">
              {language === 'es' ? 'Días restantes' : 'Remaining days'}
            </span>
            <span className={`text-2xl font-bold font-display tabular-nums ${status.color}`}>
              {remaining}
            </span>
          </div>
          <div className="flex items-baseline justify-between py-2.5">
            <span className="text-xs text-[var(--app-text-muted,rgba(240,237,232,0.38))] font-medium">
              {language === 'es' ? 'Uso del límite' : 'Limit usage'}
            </span>
            <span className="text-2xl font-bold font-display text-[var(--app-text-primary,#f0ede8)] tabular-nums">
              {percentage.toFixed(0)}<span className="text-sm font-normal ml-0.5">%</span>
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default SummaryCard;
