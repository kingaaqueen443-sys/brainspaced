import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StudyItem } from '@/types';
import { THEMES } from '@/lib/themes';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  items: StudyItem[];
}

export function CalendarView({ items }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getReviewsForDay = (date: Date) => {
    const reviews: { item: StudyItem, review: any }[] = [];
    items.forEach(item => {
      item.reviews.forEach(review => {
        if (isSameDay(parseISO(review.date), date)) {
          reviews.push({ item, review });
        }
      });
    });
    return reviews;
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="premium-card p-10 rounded-[3rem] bg-white/[0.02] border-white/[0.04]">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-2xl font-black tracking-tight">{format(currentDate, 'MMMM yyyy')}</h3>
        <div className="flex gap-3">
          <button onClick={prevMonth} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-[10px] font-black uppercase text-zinc-600 text-center tracking-widest">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const reviews = getReviewsForDay(day);
          const isCurrentMonth = isSameDay(startOfMonth(day), startOfMonth(currentDate));
          
          return (
            <motion.div 
              key={day.toString()}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "aspect-square rounded-2xl border p-1 relative flex flex-col items-center justify-center transition-all",
                !isCurrentMonth ? "opacity-20 border-transparent" : "bg-white/[0.01] border-white/[0.05]",
                isToday(day) && "border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold",
                isToday(day) ? "text-blue-400" : "text-zinc-500"
              )}>{format(day, 'd')}</span>
              
              <div className="flex flex-wrap gap-0.5 mt-1 justify-center max-w-full overflow-hidden px-1">
                {reviews.map((r, idx) => (
                  <div 
                    key={idx} 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ 
                      backgroundColor: THEMES[r.item.category].color,
                      opacity: r.review.isCompleted ? 1 : 0.4,
                      boxShadow: r.review.isCompleted ? `0 0 5px ${THEMES[r.item.category].color}` : 'none'
                    }} 
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
