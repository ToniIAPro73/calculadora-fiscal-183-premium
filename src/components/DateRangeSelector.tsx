import React, { useState } from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, AlertCircle } from 'lucide-react';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from '@/lib/dateRangeMerger';
import { validateDateRange, isDateInFuture } from '@/lib/dateValidation';
import { toast } from 'sonner';

interface DateRangeSelectorProps {
  onAddRange: (range: DateRange) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onAddRange }) => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const today = startOfDay(new Date());

  const handleAddRange = () => {
    if (startDate && endDate) {
      const validation = validateDateRange(startDate, endDate);

      if (!validation.valid) {
        toast.error(validation.error || t('toast.invalidDateRange') || 'Invalid date range');
        return;
      }

      const days = differenceInDays(endDate, startDate) + 1;
      onAddRange({ start: startDate, end: endDate, days });
      setStartDate(undefined);
      setEndDate(undefined);
      toast.success(t('toast.rangeAdded'));
    }
  };

  const isInvalid = !startDate || !endDate || endDate < startDate || isDateInFuture(startDate) || isDateInFuture(endDate);

  const disableFutureDate = (date: Date) => isDateInFuture(date);

  return (
    <Card className="ac-surface-panel--strong overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 font-serif text-2xl font-light">
          <CalendarIcon className="text-primary w-5 h-5" />
          {t('dateSelector.title')}
        </CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-widest text-[var(--text-eyebrow)]">{t('dateSelector.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="field-label ml-1">{t('dateSelector.startDate')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className={cn("field-input w-full justify-start text-left font-light min-h-[3.75rem] rounded-[22px]", !startDate && "opacity-60")}>
                  <CalendarIcon className="mr-3 h-4 w-4 opacity-70" />
                  {startDate ? format(startDate, 'PPP') : t('dateSelector.pickDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-[var(--border-default)] bg-[var(--surface-panel)] p-0 shadow-2xl">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={disableFutureDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <label className="field-label ml-1">{t('dateSelector.endDate')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className={cn("field-input w-full justify-start text-left font-light min-h-[3.75rem] rounded-[22px]", !endDate && "opacity-60")}>
                  <CalendarIcon className="mr-3 h-4 w-4 opacity-70" />
                  {endDate ? format(endDate, 'PPP') : t('dateSelector.pickDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-[var(--border-default)] bg-[var(--surface-panel)] p-0 shadow-2xl">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => isDateInFuture(date) || (!!startDate && date < startDate)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button 
          onClick={handleAddRange} 
          disabled={isInvalid} 
          className="w-full min-h-[4rem] rounded-[22px] text-xs gap-3 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-primary" />
          {t('dateSelector.addRange')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector;
