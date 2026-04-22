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
    <Card className="glass border-none rounded-3xl overflow-hidden">
      <CardContent className="p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-light">{t('summary.title') || 'Summary'}</h3>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-accent/20 ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full h-2 bg-border/20 rounded-full overflow-hidden">
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
            <p className="text-xs opacity-50 text-right">
              {totalDays} / {limit} days
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-accent/10 text-center space-y-3">
                <Icon className="w-5 h-5 opacity-60 mx-auto" />
                <div>
                  <p className="text-xs opacity-60 font-light mb-1">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
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
