"use client";

import { useState } from "react";
import { format, isToday, isPast, isFuture, addDays, parseISO } from "date-fns";
import { Plus, Check, Clock, Calendar, Zap, BookOpen, Trash2, ChevronRight, BarChart3, Settings, Lock, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyData } from "@/hooks/use-study-data";
import { generateReviews, INTERVALS } from "@/lib/spaced-repetition";
import { StudyItem, Review, Category } from "@/types";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { CalendarView } from "@/components/CalendarView";
import { Heatmap } from "@/components/Heatmap";
import { Download, Upload, LogOut, Moon, Sun, Bell, RotateCcw } from "lucide-react";

export default function Home() {
  const { items, isLoaded, addItem, updateItem, deleteItem, toggleReview, setItems } = useStudyData();
  const [activeTab, setActiveTab] = useState<"today" | "all" | "stats" | "settings">("today");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Category | "all" | "overdue">("all");
  
  // Form state
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<Category>("general");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));

  if (!isLoaded) return null;

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;

    const newItem: StudyItem = {
      id: crypto.randomUUID(),
      subject,
      category,
      note,
      startDate: new Date(startDate).toISOString(),
      reviews: generateReviews(startDate),
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    addItem(newItem);
    setSubject("");
    setNote("");
    setCategory("general");
    setShowAddForm(false);
  };

  const getTodayReviews = () => {
    const today: { item: StudyItem; review: Review }[] = [];
    for (const item of items) {
      if (activeFilter !== "all" && activeFilter !== "overdue" && item.category !== activeFilter) continue;
      
      for (const review of item.reviews) {
        const reviewDate = parseISO(review.date);
        const isAvailable = isToday(reviewDate) || isPast(reviewDate);
        const isOverdue = isPast(reviewDate) && !isToday(reviewDate) && !review.isCompleted;
        
        if (activeFilter === "overdue" && !isOverdue) continue;
        
        if (!review.isCompleted && isAvailable) {
          if (searchQuery && !item.subject.toLowerCase().includes(searchQuery.toLowerCase())) continue;
          today.push({ item, review });
        }
      }
    }
    return today.sort((a, b) => new Date(a.review.date).getTime() - new Date(b.review.date).getTime());
  };

  const getStats = () => {
    const totalReviews = items.reduce((acc, item) => acc + item.reviews.length, 0);
    const completedReviews = items.reduce((acc, item) => acc + item.reviews.filter(r => r.isCompleted).length, 0);
    const mastered = items.filter(item => item.progress === 100).length;
    const avgProgress = items.length > 0 ? Math.round(items.reduce((acc, item) => acc + item.progress, 0) / items.length) : 0;
    
    // Calculate streak
    const completionDates = new Set<string>();
    items.forEach(item => {
      item.reviews.forEach(review => {
        if (review.isCompleted && review.completedAt) {
          completionDates.add(format(parseISO(review.completedAt), "yyyy-MM-dd"));
        }
      });
    });

    let streak = 0;
    let checkDate = new Date();
    
    if (completionDates.has(format(checkDate, "yyyy-MM-dd"))) {
      streak++;
      checkDate = addDays(checkDate, -1);
      while (completionDates.has(format(checkDate, "yyyy-MM-dd"))) {
        streak++;
        checkDate = addDays(checkDate, -1);
      }
    } else {
      checkDate = addDays(checkDate, -1);
      while (completionDates.has(format(checkDate, "yyyy-MM-dd"))) {
        streak++;
        checkDate = addDays(checkDate, -1);
      }
    }
    
    return { totalReviews, completedReviews, avgProgress, streak, mastered };
  };

  const stats = getStats();
  const todayReviews = getTodayReviews();

  const getMotivationalMessage = () => {
    return "Building long-term memory, one step at a time.";
  };

  const handleExport = () => {
    const data = JSON.stringify(items);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brainspaced-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setItems(data);
        alert("Data imported successfully!");
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      setItems([]);
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      <main className="max-w-xl mx-auto px-6 py-12 md:py-16 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-xl shadow-blue-500/20">
              <Zap className="text-white w-7 h-7 fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none mb-1">BrainSpaced</h1>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em]">Premium Mastery</p>
            </div>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors shadow-lg active:border-white/20"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </header>

        {/* Daily Motivation Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/[0.03] to-purple-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h2 className="text-xl font-medium tracking-tight mb-2 text-zinc-100 italic">"Your memory compounds daily."</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-blue-500/40" />
              ))}
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">{todayReviews.length} reviews ready today • Consistency builds mastery</p>
          </div>
        </motion.div>

        {/* Dynamic Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          <CompactStat icon={<Zap className="w-4 h-4 text-orange-400" />} value={stats.streak} label="Streak" />
          <CompactStat icon={<Check className="w-4 h-4 text-green-400" />} value={stats.completedReviews} label="Total" />
          <CompactStat icon={<BookOpen className="w-4 h-4 text-purple-400" />} value={stats.mastered} label="Mastered" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("settings")}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center"
          >
            <div className="mb-2"><Settings className="w-4 h-4 text-zinc-500" /></div>
            <div className="text-[8px] font-black uppercase text-zinc-600 tracking-widest text-center mt-1">Config</div>
          </motion.button>
        </motion.div>

        {/* Filter Bar */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects..." 
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {(["all", "overdue", "physics", "biology", "chemistry"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                  activeFilter === filter
                    ? "bg-white text-black border-white"
                    : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Today Tab */}
          {activeTab === "today" && (
            <motion.div
              key="today"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-xl font-bold tracking-tight">Today's Focus</h2>
                <p className="text-zinc-500 text-sm italic">{getMotivationalMessage()}</p>
              </div>
              
              {todayReviews.length === 0 ? (
                <div className="p-16 text-center glass rounded-[2.5rem] border-dashed flex flex-col items-center justify-center bg-white/[0.01]">
                   <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center mb-6 animate-pulse">
                     <Check className="text-blue-500/40 w-10 h-10" />
                   </div>
                   <h3 className="text-zinc-300 text-lg font-bold mb-2">Rest Phase</h3>
                   <p className="text-zinc-500 text-sm max-w-[200px]">Your long-term memory is currently consolidating foundations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayReviews.map(({ item, review }) => (
                    <ReviewItem 
                      key={`${item.id}-${review.id}`} 
                      item={item} 
                      review={review} 
                      onToggle={() => toggleReview(item.id, review.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* All Subjects Tab */}
          {activeTab === "all" && (
            <motion.div
              key="all"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {items.length === 0 ? (
                <div className="p-16 text-center glass rounded-[2.5rem] border-dashed bg-white/[0.01]">
                  <Plus className="text-zinc-700 w-12 h-12 mx-auto mb-6" />
                  <h3 className="text-zinc-300 text-lg font-bold">Start Learning</h3>
                  <p className="text-zinc-500 mb-8 max-w-[200px] mx-auto text-sm">Add your first subject to begin the spaced repetition journey.</p>
                  <button onClick={() => setShowAddForm(true)} className="px-8 py-4 bg-white text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                    New Plan
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <SubjectCard key={item.id} item={item} onToggleReview={toggleReview} onDelete={() => deleteItem(item.id)} />
                ))
              )}
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Completed" value={stats.completedReviews} sub={`out of ${stats.totalReviews}`} icon={<Check className="w-5 h-5" />} />
                <StatCard label="Mastery" value={`${stats.avgProgress}%`} sub="Avg. Proficiency" icon={<Zap className="w-5 h-5" />} />
              </div>

              <Heatmap items={items} />
              
              <CalendarView items={items} />
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
               <div className="premium-card p-10 rounded-[3rem] bg-white/[0.02]">
                 <h3 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-3">
                   <Settings className="w-6 h-6 text-zinc-500" /> System Params
                 </h3>

                 <div className="space-y-4">
                   <SettingsItem 
                    icon={<Moon className="w-4 h-4" />} 
                    label="Dark Mode" 
                    description="Cinematic darkness enabled" 
                    action={<div className="w-10 h-5 bg-blue-600 rounded-full flex items-center px-1"><div className="w-3 h-3 bg-white rounded-full ml-auto" /></div>}
                   />
                   <SettingsItem 
                    icon={<Bell className="w-4 h-4" />} 
                    label="Notifications" 
                    description="Stay connected to your journey" 
                    action={<div className="w-10 h-5 bg-zinc-800 rounded-full flex items-center px-1"><div className="w-3 h-3 bg-white/20 rounded-full" /></div>}
                   />
                                      
                   <div className="pt-6 border-t border-white/[0.05] mt-6 grid grid-cols-2 gap-3">
                     <button onClick={handleExport} className="flex items-center justify-center gap-3 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                       <Download className="w-4 h-4" /> Export Backup
                     </button>
                     <label className="flex items-center justify-center gap-3 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer">
                       <Upload className="w-4 h-4" /> Import Backup
                       <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                     </label>
                   </div>

                   <button onClick={handleReset} className="w-full flex items-center justify-center gap-3 py-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all mt-4">
                     <RotateCcw className="w-4 h-4" /> Reset All Progress
                   </button>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddForm(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-[3rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h2 className="text-2xl font-black">Plan Journey</h2>
                </div>

                <form onSubmit={handleAddSubject} className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 block">Subject</label>
                    <input autoFocus value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Molecular Biology..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-white/30 transition-all font-medium text-sm" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 block">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['physics', 'biology', 'chemistry', 'general'] as Category[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={cn(
                            "py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all",
                            category === cat 
                              ? "bg-white text-black border-white" 
                              : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 block">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 [color-scheme:dark] text-sm" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 py-5 bg-white text-black rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                      Confirm Plan
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ReviewItem({ item, review, onToggle }: { item: StudyItem, review: Review, onToggle: () => void }) {
  const theme = THEMES[item.category];
  const isOverdue = (isPast(parseISO(review.date)) && !isToday(parseISO(review.date)));
  
  return (
    <motion.div 
      layout
      style={{ '--theme-glow': theme.glow, '--theme-primary': theme.color } as any}
      className={cn(
        "premium-card p-5 rounded-[2.2rem] flex items-center justify-between group transition-all duration-500 overflow-hidden relative",
        isOverdue ? "border-orange-500/30 bg-orange-500/[0.03]" : "hover:border-white/20"
      )}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex items-center gap-6 relative z-10">
        <motion.button 
          onClick={onToggle}
          className={cn(
            "w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-700 border relative overflow-hidden group/btn",
            review.isCompleted 
              ? "border-transparent shadow-[0_0_25px_-5px_var(--theme-glow)]" 
              : isOverdue 
              ? "bg-orange-500/5 border-orange-500/20"
              : "bg-white/[0.03] border-white/[0.08] hover:border-white/20"
          )}
          style={{ background: review.isCompleted ? theme.color : undefined }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {review.isCompleted ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Check className="text-white w-8 h-8 stroke-[3]" />
            </motion.div>
          ) : (
             <div className="flex flex-col items-center">
               {isOverdue ? <Clock className="text-orange-500 w-6 h-6 mb-0.5 animate-pulse" /> : <Clock className="text-zinc-500 group-hover/btn:text-zinc-300 w-6 h-6 mb-0.5 transition-colors" />}
               <span className="text-[8px] font-black uppercase text-zinc-500 group-hover/btn:text-zinc-400">Day {INTERVALS[review.order]}</span>
             </div>
          )}
          
          {/* Active Pulse for Available */}
          {!review.isCompleted && !isOverdue && (
            <div className="absolute inset-0 rounded-full bg-white/5 animate-ping opacity-20 pointer-events-none" />
          )}
        </motion.button>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.color }} />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: theme.color }}>{theme.name}</span>
             {isOverdue && (
               <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                 <Zap className="w-2.5 h-2.5 fill-orange-400" /> Overdue
               </span>
             )}
          </div>
          <h4 className="font-black text-zinc-100 text-lg leading-tight mb-0.5">{item.subject}</h4>
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-2">
            {isOverdue ? "Priority Attention Required" : "Ready for focus session"}
          </p>
        </div>
      </div>
      <div className="pr-2 relative z-10">
        <div className="w-10 h-10 rounded-full border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.05] transition-all">
          <ChevronRight className="text-zinc-700 group-hover:text-zinc-400 transition-all group-hover:translate-x-0.5" strokeWidth={3} />
        </div>
      </div>
    </motion.div>
  );
}

function SubjectCard({ item, onToggleReview, onDelete }: { item: StudyItem, onToggleReview: (iid: string, rid: string) => void, onDelete: () => void }) {
  const theme = THEMES[item.category];
  
  return (
    <motion.div 
      layout
      style={{ '--theme-bg-from': theme.gradient.split(' ')[0].replace('from-[', '').replace(']', ''), '--theme-bg-to': theme.gradient.split(' ')[1].replace('to-[', '').replace(']', ''), '--theme-primary': theme.color, '--theme-glow': theme.glow } as any}
      className={cn(
        "premium-card p-10 rounded-[3.5rem] relative group border-white/[0.04] overflow-hidden",
        theme.class
      )}
      whileHover={{ y: -5 }}
    >
      {/* Ambient card glow */}
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 blur-[100px] rounded-full pointer-events-none opacity-20" style={{ background: theme.color }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 blur-[80px] rounded-full pointer-events-none opacity-10" style={{ background: theme.color }} />

      <div className="flex justify-between items-start mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: theme.color }}>{theme.name} JOURNEY</div>
          </div>
          <h3 className="text-3xl font-black mb-3 tracking-tight group-hover:translate-x-1 transition-transform">{item.subject}</h3>
          <p className="text-sm text-zinc-500 font-medium max-w-[280px] leading-relaxed italic opacity-80">{item.note || "A journey to mastery through consistency."}</p>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-5xl font-black tracking-tighter transition-all flex items-baseline gap-1" style={{ color: theme.color }}>
             {item.progress}
             <span className="text-xl opacity-40 font-bold">%</span>
           </div>
           <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black mt-1">Foundational Mastery</span>
           <button onClick={onDelete} className="mt-6 p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all opacity-0 group-hover:opacity-100">
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Connected Memory Timeline */}
      <div className="relative z-10 px-2 mt-4">
        {/* Connection Line */}
        <div className="absolute top-7 left-10 right-10 h-[2px] bg-white/[0.03] overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-transparent via-current to-transparent"
            style={{ color: theme.color, width: `${item.progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${item.progress}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />
        </div>

        <div className="grid grid-cols-6 gap-2">
          {item.reviews.map((review, idx) => {
            const isTodayDate = isToday(parseISO(review.date));
            const isPastDate = isPast(parseISO(review.date));
            const isFutureDate = isFuture(parseISO(review.date));
            const isAvailable = isTodayDate || isPastDate;
            const isOverdue = isPastDate && !isTodayDate && !review.isCompleted;
            
            return (
              <div key={review.id} className="flex flex-col items-center gap-4 relative">
                <motion.button
                  whileHover={isAvailable ? { scale: 1.15, y: -2 } : {}}
                  whileTap={isAvailable ? { scale: 0.9 } : {}}
                  onClick={() => isAvailable && onToggleReview(item.id, review.id)}
                  disabled={!isAvailable}
                  className={cn(
                    "w-full aspect-square rounded-[1.2rem] flex items-center justify-center transition-all duration-700 border relative overflow-hidden",
                    review.isCompleted 
                      ? "border-transparent shadow-[0_10px_25px_-5px_var(--theme-glow)]" 
                      : isOverdue
                      ? "bg-orange-500/[0.08] border-orange-500/40"
                      : isTodayDate
                      ? "bg-white/10 border-white/30"
                      : isFutureDate
                      ? "bg-white/[0.02] border-white/[0.05] opacity-40 glass"
                      : "bg-white/[0.02] border-white/5 opacity-30"
                  )}
                  style={{ 
                    background: review.isCompleted ? theme.color : undefined,
                    borderColor: isTodayDate ? theme.color : undefined
                  }}
                >
                  {review.isCompleted ? (
                    <Check className="w-5 h-5 text-white stroke-[4]" />
                  ) : isFutureDate ? (
                    <Lock className="w-4 h-4 text-zinc-700" />
                  ) : (
                    <span className="text-[10px] font-black opacity-40">{idx + 1}</span>
                  )}

                  {/* Completed Glow Border */}
                  {review.isCompleted && (
                    <div className="absolute inset-0 border border-white/20 rounded-[1.2rem]" />
                  )}

                  {/* Urgent Pulse */}
                  {isOverdue && (
                    <div className="absolute inset-0 bg-orange-500/20 animate-pulse pointer-events-none" />
                  )}
                  
                  {/* Today Pulse */}
                  {isTodayDate && !review.isCompleted && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                  )}
                </motion.button>
                <div className="flex flex-col items-center gap-0.5">
                   <span className={cn(
                     "text-[10px] font-black uppercase tracking-tight transition-colors",
                     isTodayDate ? "text-white" : "text-zinc-600"
                   )}>
                     {format(parseISO(review.date), "dd/MM")}
                   </span>
                   {isTodayDate && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string, value: string | number, sub: string, icon: React.ReactNode }) {
  return (
    <div className="glass p-6 rounded-[2.5rem] flex flex-col justify-between bg-white/[0.02] border-white/[0.03]">
      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-blue-500 mb-6">
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black leading-none mb-1 tracking-tighter">{value}</div>
        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-[9px] text-zinc-600 font-bold leading-none">{sub}</div>
      </div>
    </div>
  );
}

function CompactStat({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
      <div className="mb-2">{icon}</div>
      <div className="text-xl font-black tracking-tighter">{value}</div>
      <div className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{label}</div>
    </div>
  );
}

function SettingsItem({ icon, label, description, action }: { icon: React.ReactNode, label: string, description: string, action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">{icon}</div>
        <div>
          <div className="text-xs font-black uppercase tracking-widest">{label}</div>
          <div className="text-[10px] text-zinc-600 font-medium">{description}</div>
        </div>
      </div>
      <div>{action}</div>
    </div>
  );
}
