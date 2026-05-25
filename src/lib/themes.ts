import { Category } from '@/types';

export const THEMES: Record<Category, { 
  name: string, 
  class: string, 
  color: string, 
  glow: string,
  gradient: string,
  secondary: string
}> = {
  physics: {
    name: 'Physics',
    class: 'theme-physics',
    color: '#0088ff',
    glow: 'rgba(0, 136, 255, 0.6)',
    gradient: 'from-[#040712] to-[#08102a]',
    secondary: '#3b82f6'
  },
  biology: {
    name: 'Biology',
    class: 'theme-biology',
    color: '#00d485',
    glow: 'rgba(0, 212, 133, 0.6)',
    gradient: 'from-[#030a07] to-[#0c2518]',
    secondary: '#10b981'
  },
  chemistry: {
    name: 'Chemistry',
    class: 'theme-chemistry',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.6)',
    gradient: 'from-[#0a0412] to-[#220845]',
    secondary: '#8b5cf6'
  },
  general: {
    name: 'General',
    class: 'theme-general',
    color: '#a1a1aa',
    glow: 'rgba(161, 161, 170, 0.3)',
    gradient: 'from-[#0a0a0c] to-[#18181b]',
    secondary: '#71717a'
  }
};
