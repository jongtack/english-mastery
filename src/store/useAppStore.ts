import { create } from 'zustand';

interface FeedbackData {
  exampleText?: string;
  feedback?: string;
  score?: number;
}

export interface ConversationMessage {
  role: 'AI' | 'User';
  text: string;
}

interface AppState {
  topic: string;
  englishText: string;
  feedbackData: FeedbackData | null;
  isSubmitting: boolean;
  style: 'Essay' | 'Conversation';
  level: 'Beginner' | 'Intermediate';
  recentTopics: string[];
  conversationHistory: ConversationMessage[];
  isAITyping: boolean;
  setTopic: (topic: string) => void;
  setEnglishText: (text: string) => void;
  setFeedbackData: (data: FeedbackData | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setStyle: (style: 'Essay' | 'Conversation') => void;
  setLevel: (level: 'Beginner' | 'Intermediate') => void;
  setConversationHistory: (history: ConversationMessage[] | ((prev: ConversationMessage[]) => ConversationMessage[])) => void;
  setIsAITyping: (isTyping: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  topic: '',
  englishText: '',
  feedbackData: null,
  isSubmitting: false,
  style: 'Essay',
  level: 'Beginner',
  recentTopics: [],
  conversationHistory: [],
  isAITyping: false,
  setTopic: (topic) => set((state) => {
    if (state.topic === topic) return state;
    const newRecent = [topic, ...state.recentTopics].slice(0, 15);
    return { topic, recentTopics: newRecent };
  }),
  setEnglishText: (englishText) => set((state) => state.englishText === englishText ? state : { englishText }),
  setFeedbackData: (feedbackData) => set((state) => state.feedbackData === feedbackData ? state : { feedbackData }),
  setIsSubmitting: (isSubmitting) => set((state) => state.isSubmitting === isSubmitting ? state : { isSubmitting }),
  setStyle: (style) => set((state) => state.style === style ? state : { style }),
  setLevel: (level) => set((state) => state.level === level ? state : { level }),
  setConversationHistory: (updater) => set((state) => {
    const nextHistory = typeof updater === 'function' ? updater(state.conversationHistory) : updater;
    return { conversationHistory: nextHistory };
  }),
  setIsAITyping: (isAITyping) => set({ isAITyping }),
  reset: () => set({ topic: '', englishText: '', feedbackData: null, isSubmitting: false, conversationHistory: [], isAITyping: false }),
}));
