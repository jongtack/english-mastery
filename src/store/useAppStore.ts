import { create } from 'zustand';

interface FeedbackData {
  exampleText?: string;
  feedback?: string;
  score?: number;
}

interface AppState {
  topic: string;
  englishText: string;
  feedbackData: FeedbackData | null;
  isSubmitting: boolean;
  style: 'Essay' | 'Casual Conversation';
  level: 'Beginner' | 'Intermediate';
  setTopic: (topic: string) => void;
  setEnglishText: (text: string) => void;
  setFeedbackData: (data: FeedbackData | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setStyle: (style: 'Essay' | 'Casual Conversation') => void;
  setLevel: (level: 'Beginner' | 'Intermediate') => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  topic: '',
  englishText: '',
  feedbackData: null,
  isSubmitting: false,
  style: 'Essay',
  level: 'Beginner',
  setTopic: (topic) => set({ topic }),
  setEnglishText: (englishText) => set({ englishText }),
  setFeedbackData: (feedbackData) => set({ feedbackData }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setStyle: (style) => set({ style }),
  setLevel: (level) => set({ level }),
  reset: () => set({ topic: '', englishText: '', feedbackData: null, isSubmitting: false }),
}));
