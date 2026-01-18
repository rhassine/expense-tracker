import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '@/types/chat';

/**
 * Chat store state
 */
interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Chat store actions
 */
interface ChatActions {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  clearHistory: () => void;
}

type ChatStore = ChatState & ChatActions;

const MAX_MESSAGES = 50;

/**
 * Zustand store for chat state with localStorage persistence
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isOpen: false,
      isLoading: false,
      error: null,

      addMessage: (message) => {
        const id = crypto.randomUUID();
        const newMessage: ChatMessage = {
          ...message,
          id,
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const messages = [...state.messages, newMessage];
          // Keep only last MAX_MESSAGES
          if (messages.length > MAX_MESSAGES) {
            return { messages: messages.slice(-MAX_MESSAGES) };
          }
          return { messages };
        });

        return id;
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }));
      },

      removeMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      openChat: () => {
        set({ isOpen: true });
      },

      closeChat: () => {
        set({ isOpen: false });
      },

      toggleChat: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      clearHistory: () => {
        set({ messages: [], error: null, isOpen: true });
      },
    }),
    {
      name: 'expense-tracker-chat',
      version: 1,
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);
