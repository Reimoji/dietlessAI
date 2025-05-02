import { NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/openai/client';
import { Message } from '@/lib/types/chat';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body.messages as Message[];

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Check if this is the first message in the conversation
    // We determine this by checking if there's only one message (the current user message)
    const isFirstMessage = messages.length === 1 && messages[0].role === 'user';

    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get response from OpenAI, including system prompt if it's the first message
    const response = await getChatCompletion(openAIMessages, isFirstMessage);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: `Chat error: ${error.message}` },
      { status: 500 }
    );
  }
}
