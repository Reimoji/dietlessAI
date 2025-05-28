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
  errorType?: 'message_too_long' | 'monthly_limit_exceeded' | null;
};

export type ChatError = {
  message: string;
  code?: string;
};
