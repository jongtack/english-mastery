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

export interface VocabularyData {
  word: string;
  pronunciation: string;
  levelBadge?: string;
  usageTag?: string;
  meaning: string;
  exampleSentence: string;
  exampleTranslation?: string;
  koreanPrompt: string;
}

interface AppState {
  topic: string;
  englishText: string;
  feedbackData: FeedbackData | null;
  isSubmitting: boolean;
  style: 'Essay' | 'Conversation' | 'Vocabulary';
  level: 'Beginner' | 'Intermediate';
  vocabLevel: 'Middle' | 'High' | 'College' | 'Business';
  recentTopics: string[];
  conversationHistory: ConversationMessage[];
  isAITyping: boolean;
  vocabData: VocabularyData | null;
  setTopic: (topic: string) => void;
  setEnglishText: (text: string) => void;
  setFeedbackData: (data: FeedbackData | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setStyle: (style: 'Essay' | 'Conversation' | 'Vocabulary') => void;
  setLevel: (level: 'Beginner' | 'Intermediate') => void;
  setVocabLevel: (vocabLevel: 'Middle' | 'High' | 'College' | 'Business') => void;
  setConversationHistory: (history: ConversationMessage[] | ((prev: ConversationMessage[]) => ConversationMessage[])) => void;
  setIsAITyping: (isTyping: boolean) => void;
  setVocabData: (data: VocabularyData | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  topic: '',
  englishText: '',
  feedbackData: null,
  isSubmitting: false,
  style: 'Vocabulary',
  level: 'Beginner',
  vocabLevel: 'High',
  recentTopics: [],
  conversationHistory: [],
  isAITyping: false,
  vocabData: null,
  setTopic: (topic) => set((state) => {
    if (state.topic === topic) return state;
    const newRecent = [topic, ...state.recentTopics].slice(0, 100);
    return { topic, recentTopics: newRecent };
  }),
  setEnglishText: (englishText) => set((state) => state.englishText === englishText ? state : { englishText }),
  setFeedbackData: (feedbackData) => set((state) => state.feedbackData === feedbackData ? state : { feedbackData }),
  setIsSubmitting: (isSubmitting) => set((state) => state.isSubmitting === isSubmitting ? state : { isSubmitting }),
  setStyle: (style) => set((state) => state.style === style ? state : { style }),
  setLevel: (level) => set((state) => state.level === level ? state : { level }),
  setVocabLevel: (vocabLevel) => set((state) => state.vocabLevel === vocabLevel ? state : { vocabLevel }),
  setConversationHistory: (updater) => set((state) => {
    const nextHistory = typeof updater === 'function' ? updater(state.conversationHistory) : updater;
    return { conversationHistory: nextHistory };
  }),
  setIsAITyping: (isAITyping) => set({ isAITyping }),
  setVocabData: (vocabData) => set((state) => state.vocabData === vocabData ? state : { vocabData }),
  reset: () => set({ topic: '', englishText: '', feedbackData: null, isSubmitting: false, conversationHistory: [], isAITyping: false, vocabData: null }),
}));
