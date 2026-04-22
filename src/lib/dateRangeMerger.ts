import { differenceInDays, eachDayOfInterval, isWithinInterval, max } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
  days: number;
}

export interface AnnotatedRange extends DateRange {
  overlapDays: number;
}

export const mergeDateRanges = (ranges: DateRange[]) => {
  if (!ranges || ranges.length === 0) {
    return { merged: [], hasOverlap: false, annotatedRanges: [] };
  }

  const sortedRanges = [...ranges].sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged: DateRange[] = [{ ...sortedRanges[0] }];
  let hasOverlap = false;

  for (let i = 1; i < sortedRanges.length; i++) {
    const current = sortedRanges[i];
    const lastMerged = merged[merged.length - 1];

    if (current.start <= lastMerged.end) {
      hasOverlap = true;
      lastMerged.end = max([lastMerged.end, current.end]);
      lastMerged.days = differenceInDays(lastMerged.end, lastMerged.start) + 1;
    } else {
      merged.push({ ...current });
    }
  }

  const annotatedRanges: AnnotatedRange[] = ranges.map((range, index) => {
    const overlapDays = eachDayOfInterval({ start: range.start, end: range.end }).reduce((count, day) => {
      const overlapsWithAnotherRange = ranges.some((otherRange, otherIndex) => {
        if (otherIndex === index) return false;
        return isWithinInterval(day, { start: otherRange.start, end: otherRange.end });
      });

      return overlapsWithAnotherRange ? count + 1 : count;
    }, 0);

    return { ...range, overlapDays };
  });

  return { merged, hasOverlap, annotatedRanges };
};

export const calculateUniqueDays = (mergedRanges: DateRange[]) => {
  return mergedRanges.reduce((sum, range) => sum + range.days, 0);
};
