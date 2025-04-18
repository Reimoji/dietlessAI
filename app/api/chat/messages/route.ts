import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { ChatMessage, chatMessages, chats } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, desc, asc } from 'drizzle-orm';
import { Message } from '@/lib/types/chat';
import { teams, teamMembers } from '@/lib/db/schema';

async function checkSubscription(userId: number) {
  const teamMember = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, userId),
    with: {
      team: {
        columns: {
          id: true,
          subscriptionStatus: true
        }
      }
    }
  });

  if (!teamMember?.team) {
    return false;
  }

  return ['active', 'trialing'].includes(teamMember.team.subscriptionStatus ?? '');
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasSubscription = await checkSubscription(session.user.id);
    if (!hasSubscription) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }

    // Get the user's most recent chat
    const chat = await db.query.chats.findFirst({
      where: eq(chats.userId, session.user.id),
      orderBy: [desc(chats.createdAt)],
      with: {
        messages: {
          orderBy: [asc(chatMessages.createdAt)]
        }
      }
    });

    // Transform the messages to match the Message type
    const messages: Message[] = (chat?.messages || []).map(msg => ({
      id: String((msg as ChatMessage).id),
      content: (msg as ChatMessage).content,
      role: (msg as ChatMessage).role as 'user' | 'assistant',
      createdAt: (msg as ChatMessage).createdAt
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: `Failed to get messages: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.content || !message.role) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Validate message role
    if (!['user', 'assistant'].includes(message.role)) {
      return NextResponse.json(
        { error: 'Invalid message role' },
        { status: 400 }
      );
    }

    // Get or create a chat for the user
    let chat = await db.query.chats.findFirst({
      where: (chats, { eq }) => eq(chats.userId, session.user.id),
      orderBy: (chats, { desc }) => [desc(chats.createdAt)]
    });

    if (!chat) {
      const [newChat] = await db
        .insert(chats)
        .values({
          userId: session.user.id,
        })
        .returning();
      chat = newChat;
    }

    // Ensure proper date handling
    const createdAt = message.createdAt ? new Date(message.createdAt) : new Date();

    // Save the message
    const [savedMessage] = await db
      .insert(chatMessages)
      .values({
        chatId: chat.id,
        content: message.content,
        role: message.role,
        createdAt
      })
      .returning();

    // Transform the saved message to match the Message type
    const transformedMessage: Message = {
      id: savedMessage.id.toString(),
      content: savedMessage.content,
      role: savedMessage.role as 'user' | 'assistant',
      createdAt: savedMessage.createdAt
    };

    return NextResponse.json({ message: transformedMessage });
  } catch (error: any) {
    console.error('Save message error:', error);
    return NextResponse.json(
      { error: `Failed to save message: ${error.message}` },
      { status: 500 }
    );
  }
}

