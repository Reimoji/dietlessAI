'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/lib/stores/chat';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from 'lucide-react';

function SubscriptionRequired() {
  const router = useRouter();
  
  return (
    <div className="h-full p-4">
      <Card className="h-full flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Subscription Required</h2>
        <p className="text-muted-foreground mb-6">
          Chat feature is only available for subscribed users.
        </p>
        <Button onClick={() => router.push('/pricing')}>
          View Pricing Plans
        </Button>
      </Card>
    </div>
  );
}

function ChatPage() {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const response = await fetch('/api/teams/subscription');
        if (!response.ok) {
          const data = await response.json();
          console.error('Subscription check failed:', data.error);
          setHasSubscription(false);
          return;
        }
        const data = await response.json();
        // Accept both 'trialing' and 'active' statuses
        setHasSubscription(['active', 'trialing'].includes(data.status));
      } catch (error) {
        console.error('Subscription check error:', error);
        setHasSubscription(false);
      }
    }
    
    checkSubscription();
  }, []);

  if (hasSubscription === false) {
    return <SubscriptionRequired />;
  }

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
      createdAt: new Date().toISOString() // Ensure we send ISO string
    };

    try {
      setLoading(true);
      addMessage({
        ...userMessage,
        createdAt: new Date()
      });
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
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
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
              key={`${message.role}-${index}-${message.createdAt.getTime()}`}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {message.content}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(message.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
            <Button 
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ChatPage;



















