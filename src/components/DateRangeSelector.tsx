import React, { useState } from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from '@/lib/dateRangeMerger';

interface DateRangeSelectorProps {
  onAddRange: (range: DateRange) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onAddRange }) => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleAddRange = () => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate) + 1;
      onAddRange({ start: startDate, end: endDate, days });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const isInvalid = !startDate || !endDate || endDate < startDate;

  return (
    <Card className="glass border-none rounded-[32px] overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 font-serif text-2xl font-light">
          <CalendarIcon className="text-primary w-5 h-5" />
          {t('dateSelector.title')}
        </CardTitle>
        <CardDescription className="opacity-70 text-[11px] uppercase tracking-widest">{t('dateSelector.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold ml-1">{t('dateSelector.startDate')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className={cn("w-full justify-start text-left font-light h-14 rounded-xl bg-accent border border-border hover:bg-accent/80 transition-all", !startDate && "opacity-60")}>
                  <CalendarIcon className="mr-3 h-4 w-4 opacity-70" />
                  {startDate ? format(startDate, 'PPP') : t('dateSelector.pickDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass border-border/50">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold ml-1">{t('dateSelector.endDate')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className={cn("w-full justify-start text-left font-light h-14 rounded-xl bg-accent border border-border hover:bg-accent/80 transition-all", !endDate && "opacity-60")}>
                  <CalendarIcon className="mr-3 h-4 w-4 opacity-70" />
                  {endDate ? format(endDate, 'PPP') : t('dateSelector.pickDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass border-border/50">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => !!startDate && date < startDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button 
          onClick={handleAddRange} 
          disabled={isInvalid} 
          className="w-full h-16 text-xs tracking-[0.3em] font-bold gap-3 rounded-2xl bg-accent hover:bg-accent/80 border border-border transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-primary" />
          {t('dateSelector.addRange')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector;
