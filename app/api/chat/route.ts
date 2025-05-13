import { NextRequest, NextResponse } from 'next/server';
import { getChatCompletionWithTracking } from '@/lib/openai/client';
import { Message } from '@/lib/types/chat';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { chats, chatMessages } from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { TOKEN_LIMITS } from '@/lib/tokens/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages as Message[];
    
    // Early validation of message length
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const estimatedTokens = lastMessage.content.length / 4;
      console.log(`Estimated tokens for message: ${estimatedTokens}`);
      
      if (estimatedTokens > TOKEN_LIMITS.MAX_INPUT_TOKENS) {
        console.log(`Message too long: ~${estimatedTokens} tokens (limit: ${TOKEN_LIMITS.MAX_INPUT_TOKENS})`);
        return NextResponse.json(
          { 
            error: "Your message is too long. Please shorten it a bit.",
            errorType: 'message_too_long'
          }, 
          { status: 400 }
        );
      }
    }
    
    // Get the session to identify the user
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Find the user's chat (there should be only one per user)
    const userChat = await db.query.chats.findFirst({
      where: eq(chats.userId, userId),
      orderBy: [desc(chats.createdAt)]
    });

    if (!userChat) {
      return NextResponse.json(
        { error: 'No chat found for user' },
        { status: 404 }
      );
    }

    const chatId = userChat.id;
    
    // Check if this is the first message in the conversation
    const isFirstMessage = messages.length === 1 && messages[0].role === 'user';

    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get the latest message ID
    const latestMessage = await db.query.chatMessages.findFirst({
      where: eq(chatMessages.chatId, chatId),
      orderBy: [desc(chatMessages.id)]
    });
    
    const messageId = latestMessage?.id || 1;

    // Check message length before sending to OpenAI
    const userMessage = messages[messages.length - 1];
    if (userMessage && userMessage.role === 'user') {
      // Rough token estimation (4 chars ≈ 1 token)
      const estimatedTokens = userMessage.content.length / 4;
      if (estimatedTokens > TOKEN_LIMITS.MAX_INPUT_TOKENS) {
        return NextResponse.json(
          { 
            error: "Your message is too long. Please shorten it a bit.",
            errorType: 'message_too_long'
          }, 
          { status: 400 }
        );
      }
    }

    // Get response from OpenAI with token tracking
    const response = await getChatCompletionWithTracking(
      openAIMessages,
      userId,
      chatId,
      messageId,
      isFirstMessage
    );

    // If there's an error, return it with appropriate status code
    if (response.error) {
      // Check error type
      if (response.errorType === 'message_too_long') {
        return NextResponse.json(
          { 
            error: response.error,
            errorType: 'message_too_long'
          }, 
          { status: 400 }
        );
      } else if (response.limitExceeded) {
        return NextResponse.json(
          { 
            error: "You've reached your monthly chat limit. Try implementing some of the nutrition and fitness advice you've discussed with dietlessAI. You can do it!",
            errorType: 'monthly_limit_exceeded'
          }, 
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    // Check for empty content
    if (!response.content.trim()) {
      return NextResponse.json(
        { error: "The AI generated an empty response. Please try again." },
        { status: 500 }
      );
    }

    // Return the response with any warnings
    return NextResponse.json({
      message: {
        content: response.content,
        role: 'assistant',
        createdAt: new Date().toISOString()
      },
      warning: response.warning,
      warningLevel: response.warningLevel
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: `Chat error: ${error.message}` },
      { status: 500 }
    );
  }
}
