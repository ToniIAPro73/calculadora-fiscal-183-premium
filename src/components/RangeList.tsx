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
    <Card className="glass border-none rounded-[32px] overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/10">
        <CardTitle className="text-xl font-serif font-light flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          {t('rangeList.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <TooltipProvider>
          {ranges.length === 0 ? (
            <div className="p-12 text-center opacity-60 text-xs uppercase tracking-widest leading-loose">
              {t('rangeList.empty')}
            </div>
          ) : (
            <div className="divide-y divide-border/10 max-h-[400px] overflow-y-auto custom-scrollbar">
              {ranges.map((range, index) => (
                <div key={index} className="flex items-center justify-between p-6 hover:bg-accent/40 transition-all group">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 font-light text-sm tracking-wide">
                      <span className="opacity-80">{format(range.start, 'MMM d, yyyy')}</span>
                      <span className="opacity-60">—</span>
                      <span className="opacity-80">{format(range.end, 'MMM d, yyyy')}</span>
                      {range.overlapDays > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="w-4 h-4 text-amber-500/60 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="glass border-border text-xs">{t('rangeList.overlapTooltip')}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60 flex items-center gap-2">
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
                    className="h-10 w-10 opacity-20 hover:text-red-400 hover:opacity-100 hover:bg-red-400/10 rounded-full transition-all group-hover:opacity-40"
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
