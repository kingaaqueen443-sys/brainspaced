import { addDays, format, startOfDay } from 'date-fns';
import { Review } from '@/types';

export const INTERVALS = [0, 1, 3, 7, 14, 30];

export const generateReviews = (startDateStr: string): Review[] => {
  const startDate = startOfDay(new Date(startDateStr));
  
  return INTERVALS.map((days, index) => {
    const reviewDate = addDays(startDate, days);
    return {
      id: crypto.randomUUID(),
      date: reviewDate.toISOString(),
      isCompleted: false,
      order: index,
    };
  });
};

export const calculateProgress = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const completed = reviews.filter(r => r.isCompleted).length;
  return Math.round((completed / reviews.length) * 100);
};

export const getStatusForDate = (dateStr: string) => {
  const today = startOfDay(new Date());
  const date = startOfDay(new Date(dateStr));
  
  if (date.getTime() === today.getTime()) return 'today';
  if (date.getTime() < today.getTime()) return 'overdue';
  return 'upcoming';
};

export const formatStatus = (dateStr: string) => {
  const status = getStatusForDate(dateStr);
  const date = new Date(dateStr);
  
  if (status === 'today') return 'Today';
  if (status === 'overdue') return 'Overdue';
  
  return `In ${format(date, 'd')} days`; // Simplified for now
};
