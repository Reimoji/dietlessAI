'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useChatStore } from '@/lib/stores/chat';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Move components outside of the main component
const TypingIndicator = () => (
  <div className="flex space-x-2 p-3 bg-muted rounded-lg w-16">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

// Single message box skeleton
const MessageBoxSkeleton = ({ align = "left" }) => (
  <div className={`mb-4 ${align === "right" ? "text-right" : "text-left"}`}>
    <div 
      className={`inline-block p-3 rounded-lg ${
        align === "right" ? "bg-primary/10" : "bg-muted"
      }`}
    >
      <Skeleton className="h-8 w-[200px]" />
    </div>
    <div className="mt-1">
      <Skeleton className="h-3 w-12 inline-block" />
    </div>
  </div>
);

// Conversation skeleton showing multiple messages
const ConversationSkeleton = () => (
  <div className="space-y-4">
    {/* First message (left) */}
    <MessageBoxSkeleton align="left" />

    {/* Second message (right) */}
    <MessageBoxSkeleton align="right" />

    {/* Third message (left) */}
    <MessageBoxSkeleton align="left" />

    {/* Fourth message (right) */}
    <MessageBoxSkeleton align="right" />

    {/* Fifth message (left) */}
    <MessageBoxSkeleton align="left" />
  </div>
);

// Format date safely
const formatTime = (date: Date | string | undefined) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString();
  } catch (e) {
    return '';
  }
};

function ChatPage() {
  const [input, setInput] = useState('');
  const { 
    messages, 
    addMessage, 
    isLoading, 
    setLoading, 
    loadMessages,
    error 
  } = useChatStore();
  
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load messages on mount
  useEffect(() => {
    const init = async () => {
      try {
        await loadMessages();
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    init();
  }, [loadMessages]);

  // Handle typing indicator
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      setIsTyping(true);
      timeout = setTimeout(() => setIsTyping(false), 1000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      content: input.trim(),
      role: 'user' as const,
      createdAt: new Date()
    };

    try {
      setLoading(true);
      addMessage(userMessage);
      setInput('');

      // Save user message
      const messageResponse = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to save message');
      }

      // Get AI response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await chatResponse.json();
      if (data.error) throw new Error(data.error);

      const assistantMessage = {
        content: data.content,
        role: 'assistant' as const,
        createdAt: new Date()
      };

      // Save assistant message
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: assistantMessage })
      });

      addMessage(assistantMessage);
    } catch (error: any) {
      console.error('Chat error:', error);
      addMessage({
        content: 'Sorry, there was an error processing your request.',
        role: 'assistant',
        createdAt: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-full p-4">
        <Card className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <ConversationSkeleton />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <Card className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatTime(message.createdAt)}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="mb-4">
              <TypingIndicator />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="border-t p-4 bg-card">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ChatPage;




