import { useState, useEffect } from 'react';
import { StudyItem } from '@/types';

const STORAGE_KEY = 'brainspaced_study_data';

export function useStudyData() {
  const [items, setItems] = useState<StudyItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load study data', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (item: StudyItem) => {
    setItems(prev => [item, ...prev]);
  };

  const updateItem = (updatedItem: StudyItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleReview = (itemId: string, reviewId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newReviews = item.reviews.map(review => {
          if (review.id === reviewId) {
            const isCompleted = !review.isCompleted;
            return {
              ...review,
              isCompleted,
              completedAt: isCompleted ? new Date().toISOString() : undefined
            };
          }
          return review;
        });
        
        const completedCount = newReviews.filter(r => r.isCompleted).length;
        const progress = Math.round((completedCount / newReviews.length) * 100);
        
        return { ...item, reviews: newReviews, progress };
      }
      return item;
    }));
  };

  return { items, isLoaded, addItem, updateItem, deleteItem, toggleReview, setItems };
}
