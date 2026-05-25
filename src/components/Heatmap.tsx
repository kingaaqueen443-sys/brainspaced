import React from 'react';
import { format, subDays, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { StudyItem } from '@/types';
import { THEMES } from '@/lib/themes';
import { motion } from 'framer-motion';

interface HeatmapProps {
  items: StudyItem[];
}

export function Heatmap({ items }: HeatmapProps) {
  const days = eachDayOfInterval({
    start: subDays(new Date(), 90), // Last 90 days
    end: new Date(),
  });

  const getActivityForDay = (date: Date) => {
    let count = 0;
    const itemColors: string[] = [];
    
    items.forEach(item => {
      item.reviews.forEach(review => {
        if (review.isCompleted && review.completedAt && isSameDay(parseISO(review.completedAt), date)) {
          count++;
          if (!itemColors.includes(THEMES[item.category].color)) {
            itemColors.push(THEMES[item.category].color);
          }
        }
      });
    });
    
    return { count, colors: itemColors };
  };

  return (
    <div className="premium-card p-8 rounded-[2.5rem] bg-white/[0.02]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Activity Intensity</h3>
        <div className="flex gap-2 text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
           <span>Less</span>
           <div className="flex gap-1">
             {[0.1, 0.3, 0.6, 0.9].map(op => (
               <div key={op} className="w-2 h-2 rounded-sm bg-blue-500" style={{ opacity: op }} />
             ))}
           </div>
           <span>More</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {days.map((day, i) => {
          const { count, colors } = getActivityForDay(day);
          const opacity = count === 0 ? 0.05 : Math.min(0.2 + (count * 0.2), 1);
          
          return (
            <div 
              key={day.toString()}
              className="w-3.5 h-3.5 rounded-sm relative group cursor-help transition-all"
              style={{ 
                backgroundColor: colors.length > 0 ? colors[0] : '#3b82f6',
                opacity: count === 0 ? 0.05 : opacity,
                boxShadow: count > 0 ? `0 0 10px ${colors[0]}44` : 'none'
              }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-white/10 rounded-md text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {format(day, 'MMM d')}: {count} reviews
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
