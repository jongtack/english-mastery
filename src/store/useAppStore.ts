import { create } from 'zustand';

interface FeedbackData {
  correctedText?: string;
  feedback?: string;
  score?: number;
}

interface AppState {
  topic: string;
  koreanText: string;
  englishText: string;
  feedbackData: FeedbackData | null;
  isSubmitting: boolean;
  setTopic: (topic: string) => void;
  setKoreanText: (text: string) => void;
  setEnglishText: (text: string) => void;
  setFeedbackData: (data: FeedbackData | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  topic: '',
  koreanText: '',
  englishText: '',
  feedbackData: null,
  isSubmitting: false,
  setTopic: (topic) => set({ topic }),
  setKoreanText: (koreanText) => set({ koreanText }),
  setEnglishText: (englishText) => set({ englishText }),
  setFeedbackData: (feedbackData) => set({ feedbackData }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () => set({ topic: '', koreanText: '', englishText: '', feedbackData: null, isSubmitting: false }),
}));
