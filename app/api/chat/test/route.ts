import { NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/openai/client';

export async function POST() {
  try {
    console.log('Starting OpenAI test...');
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('Model:', process.env.OPENAI_MODEL || 'gpt-4-turbo-preview');
    
    const response = await getChatCompletion([
      {
        role: 'user',
        content: 'Hello, are you working?'
      }
    ]);

    console.log('Got response:', response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Test endpoint error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: `OpenAI test failed: ${error.message}` },
      { status: 500 }
    );
  }
}
