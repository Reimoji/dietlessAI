import OpenAI from 'openai';
import { OpenAIMessage, ChatResponse } from 'lib/openai/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(messages: OpenAIMessage[]): Promise<ChatResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano-2025-04-14',
      messages: messages,
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
