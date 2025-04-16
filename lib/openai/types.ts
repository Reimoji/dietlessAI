import type { CompletionUsage } from 'openai/resources';

export type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  content: string;
  role: 'assistant';
  error: string | null;
  refusal: string | null;
  annotations: any[];
  usage: CompletionUsage | null;
};

export type ChatError = {
  message: string;
  code?: string;
};

