import { create } from 'zustand';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  loadMessages: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, {
        ...message,
        createdAt: new Date(message.createdAt)
      }]
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  loadMessages: async () => {
    try {
      const response = await fetch('/api/chat/messages');
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      const data = await response.json();
      
      // Ensure dates are properly parsed
      const messages = data.messages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt)
      }));
      
      set({ messages, error: null });
    } catch (error: any) {
      console.error('Load messages error:', error);
      set({ 
        error: error.message,
        messages: []
      });
    }
  }
}));





