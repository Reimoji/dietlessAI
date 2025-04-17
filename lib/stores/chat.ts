import { create } from 'zustand';
import { Message } from '@/lib/types/chat';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  loadMessages: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
  loadMessages: async () => {
    try {
      const response = await fetch('/api/chat/messages');
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      set({ messages: data.messages });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }
}));
