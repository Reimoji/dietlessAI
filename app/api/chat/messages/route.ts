import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { chatMessages, chats, teamMembers } from '@/lib/db/schema';
import { Message } from '@/lib/types/chat';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

async function checkSubscription(userId: number) {
  const teamMember = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, userId),
    with: {
      team: {
        columns: {
          id: true,
          subscriptionStatus: true,
        },
      },
    },
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
          orderBy: [asc(chatMessages.createdAt)],
        },
      },
    });

    // If no chat exists, create one
    if (!chat) {
      console.log(`Creating new chat for user ${session.user.id} in GET messages`);
      const [newChat] = await db
        .insert(chats)
        .values({
          userId: session.user.id,
        })
        .returning();

      // Return empty messages array for the new chat
      return NextResponse.json({
        messages: [],
        chatId: newChat.id,
      });
    }

    // Transform messages to the expected format
    const messages = chat.messages.map((message) => ({
      id: message.id.toString(),
      content: message.content,
      role: message.role,
      createdAt: message.createdAt,
    }));

    return NextResponse.json({ messages, chatId: chat.id });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: `Failed to get messages: ${error.message}` },
      { status: 500 },
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
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Validate message role
    if (!['user', 'assistant'].includes(message.role)) {
      return NextResponse.json({ error: 'Invalid message role' }, { status: 400 });
    }

    // Get all chats for the user
    const userChats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, session.user.id))
      .orderBy(desc(chats.createdAt));

    let chat;

    // If no chats exist, create a new one
    if (userChats.length === 0) {
      const [newChat] = await db
        .insert(chats)
        .values({
          userId: session.user.id,
        })
        .returning();
      chat = newChat;
    } else {
      // Use the most recent chat
      chat = userChats[0];

      // If there are multiple chats, delete the extras
      if (userChats.length > 1) {
        const extraChatIds = userChats.slice(1).map((c) => c.id);

        // First delete messages from extra chats
        await db.delete(chatMessages).where(inArray(chatMessages.chatId, extraChatIds));

        // Then delete the extra chats
        await db.delete(chats).where(inArray(chats.id, extraChatIds));
      }
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
        createdAt,
      })
      .returning();

    // Transform the saved message to match the Message type
    const transformedMessage: Message = {
      id: savedMessage.id.toString(),
      content: savedMessage.content,
      role: savedMessage.role as 'user' | 'assistant',
      createdAt: savedMessage.createdAt,
    };

    return NextResponse.json({ message: transformedMessage });
  } catch (error: any) {
    console.error('Save message error:', error);

    // Add token limit handling
    if (error.message?.includes('token limit exceeded')) {
      return NextResponse.json({ error: error.message, limitExceeded: true }, { status: 429 });
    }

    return NextResponse.json(
      { error: `Failed to save message: ${error.message}` },
      { status: 500 },
    );
  }
}
