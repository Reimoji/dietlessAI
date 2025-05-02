import OpenAI from 'openai';
import { OpenAIMessage, ChatResponse } from 'lib/openai/types';
import { systemPrompt } from './system-prompt';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(
  messages: OpenAIMessage[], 
  includeSystemPrompt: boolean = false
): Promise<ChatResponse> {
  try {
    // Convert messages to the correct type for OpenAI API
    const apiMessages = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    }));
    
    // Add system prompt if requested
    const messagesWithSystem = includeSystemPrompt 
      ? [{ role: 'system' as const, content: systemPrompt }, ...apiMessages]
      : apiMessages;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano-2025-04-14',
      messages: messagesWithSystem,
      store: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const message = completion.choices[0].message;
    return {
      content: message.content || '',
      role: 'assistant',
      error: null,
      refusal: message.refusal || null,
      annotations: message.annotations || [],
      usage: completion.usage || null
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', {
      message: error.message,
      type: error.type,
      stack: error.stack,
      response: error.response
    });
    
    return {
      content: '',
      role: 'assistant',
      error: `AI Error: ${error.message}`,
      refusal: null,
      annotations: [],
      usage: null
    };
  }
}
