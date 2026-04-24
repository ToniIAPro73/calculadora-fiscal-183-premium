import { isAfter, startOfDay } from 'date-fns';

export const isDateInFuture = (date: Date): boolean => {
  const today = startOfDay(new Date());
  return isAfter(date, today);
};

export const validateDateRange = (startDate: Date, endDate: Date): {
  valid: boolean;
  error?: string;
} => {
  if (isDateInFuture(startDate)) {
    return {
      valid: false,
      error: 'Start date cannot be in the future',
    };
  }

  if (isDateInFuture(endDate)) {
    return {
      valid: false,
      error: 'End date cannot be in the future',
    };
  }

  if (endDate < startDate) {
    return {
      valid: false,
      error: 'End date must be after start date',
    };
  }

  return { valid: true };
};
