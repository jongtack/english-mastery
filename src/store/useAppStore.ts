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
  setTopic: (topic) => set((state) => state.topic === topic ? state : { topic }),
  setEnglishText: (englishText) => set((state) => state.englishText === englishText ? state : { englishText }),
  setFeedbackData: (feedbackData) => set((state) => state.feedbackData === feedbackData ? state : { feedbackData }),
  setIsSubmitting: (isSubmitting) => set((state) => state.isSubmitting === isSubmitting ? state : { isSubmitting }),
  setStyle: (style) => set((state) => state.style === style ? state : { style }),
  setLevel: (level) => set((state) => state.level === level ? state : { level }),
  reset: () => set({ topic: '', englishText: '', feedbackData: null, isSubmitting: false }),
}));
