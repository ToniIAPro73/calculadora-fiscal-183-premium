import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { AnnotatedRange } from '@/lib/dateRangeMerger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Trash2, AlertTriangle, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RangeListProps {
  ranges: AnnotatedRange[];
  onRemoveRange: (index: number) => void;
}

const RangeList: React.FC<RangeListProps> = ({ ranges, onRemoveRange }) => {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[var(--border-subtle)] pb-4">
        <CardTitle className="text-xl font-display font-light flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          {t('rangeList.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <TooltipProvider>
          {ranges.length === 0 ? (
            <div className="p-12 text-center text-xs uppercase tracking-widest leading-loose text-[var(--text-muted)]">
              {t('rangeList.empty')}
            </div>
          ) : (
            <div className="custom-scrollbar max-h-[400px] divide-y divide-[var(--border-subtle)] overflow-y-auto">
              {ranges.map((range, index) => (
                <div key={index} className="group flex items-center justify-between p-6 transition-all hover:bg-[color-mix(in_srgb,var(--surface-subtle)_85%,transparent)]">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 font-light text-sm tracking-wide">
                      <span className="text-[var(--text-primary)]">{format(range.start, 'MMM d, yyyy')}</span>
                      <span className="text-[var(--text-muted)]">—</span>
                      <span className="text-[var(--text-primary)]">{format(range.end, 'MMM d, yyyy')}</span>
                      {range.overlapDays > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="w-4 h-4 text-amber-500/60 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="border-[var(--border-default)] bg-[var(--surface-panel)] text-xs">{t('rangeList.overlapTooltip')}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      <span className="text-primary">{range.days} {range.days === 1 ? t('dateSelector.day') : t('dateSelector.days')}</span>
                      {range.overlapDays > 0 && (
                        <span className="text-red-500/50">({range.overlapDays} overlapped)</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveRange(index)}
                    className="h-10 w-10 opacity-20 transition-all group-hover:opacity-40 hover:bg-red-400/10 hover:text-red-400 hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default RangeList;
