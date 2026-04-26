import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

interface SummaryCardProps {
  totalDays: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ totalDays }) => {
  const { t } = useLanguage();

  const limit = 183;
  const remaining = Math.max(limit - totalDays, 0);
  const percentage = Math.min((totalDays / limit) * 100, 100);

  const getStatusColor = () => {
    if (totalDays <= 150) return 'text-emerald-500';
    if (totalDays <= 183) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (totalDays <= 150) return t('progress.safe') || 'Safe Zone';
    if (totalDays <= 183) return t('progress.approaching') || 'Approaching Limit';
    return t('progress.over') || 'Over Limit';
  };

  const stats = [
    {
      label: t('stats.totalDays') || 'Total Days',
      value: totalDays,
      icon: BarChart3,
    },
    {
      label: t('stats.remainingDays') || 'Remaining Days',
      value: remaining,
      icon: TrendingUp,
    },
    {
      label: t('stats.limitUsage') || 'Limit Usage',
      value: `${percentage.toFixed(1)}%`,
      icon: AlertCircle,
    },
  ];

  return (
    <Card className="ac-surface-panel--strong overflow-hidden">
      <CardContent className="p-8 space-y-8">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[var(--accent,var(--color-accent-primary))]">
            {t('summary.eyebrow') || 'RESIDENCIA FISCAL'}
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-semibold text-[var(--text-primary)]">{t('summary.title') || 'Resumen'}</h3>
            <span className={`rounded-full border border-[var(--border-default)] px-3 py-1 text-xs font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
              <div
                className={`h-full transition-all duration-500 ${
                  totalDays <= 150
                    ? 'bg-emerald-500'
                    : totalDays <= 183
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-right text-[var(--text-muted)]">
              {totalDays} / {limit} days
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="anclora-metric-tile text-center space-y-3">
                <Icon className="w-5 h-5 opacity-60 mx-auto" />
                <div>
                  <p className="mb-1 text-xs font-light text-[var(--text-muted)]">{stat.label}</p>
                  <p className="text-xl font-semibold text-[var(--text-primary)]">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
