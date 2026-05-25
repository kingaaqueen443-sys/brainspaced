export interface Review {
  id: string;
  date: string; // ISO string
  isCompleted: boolean;
  completedAt?: string;
  order: number; // 0 to 5 for the [0, 1, 3, 7, 14, 30] sequence
}

export type Category = 'physics' | 'biology' | 'chemistry' | 'general';

export interface StudyItem {
  id: string;
  subject: string;
  category: Category;
  note?: string;
  startDate: string; // ISO string
  reviews: Review[];
  createdAt: string;
  progress: number; // 0 to 100
}

export interface StudyStats {
  totalCompleted: number;
  currentStreak: number;
  completionPercentage: number;
}
