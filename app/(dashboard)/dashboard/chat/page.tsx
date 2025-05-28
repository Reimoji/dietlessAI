'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChunkReveal } from '@/components/ui/chunk-reveal';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatMessage } from '@/lib/format-message';
import { useChatStore } from '@/lib/stores/chat';
import { Loader2, SendHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

function SubscriptionRequired() {
  const router = useRouter();

  return (
    <div className='h-full p-4'>
      <Card className='h-full flex flex-col items-center justify-center p-6'>
        <h2 className='text-2xl font-bold mb-4'>Subscription Required</h2>
        <p className='text-muted-foreground mb-6'>
          Chat feature is only available for subscribed users.
        </p>
        <Button onClick={() => router.push('/pricing')}>View Pricing Plans</Button>
      </Card>
    </div>
  );
}

function ChatPage() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  // Chat store hook
  const { messages, addMessage, isLoading, setLoading, loadMessages } = useChatStore();

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check subscription effect
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

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isInitialLoading) {
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialLoading]);

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

  // NOW WE CAN DO CONDITIONAL RENDERING AFTER ALL HOOKS
  if (hasSubscription === false) {
    return <SubscriptionRequired />;
  }

  // Extract the core submission logic
  const submitMessage = async () => {
    if (!input.trim() || isLoading) return;

    setLoading(true);

    // Add user message to UI immediately
    const userMessage = {
      content: input,
      role: 'user' as const,
      createdAt: new Date(),
    };
    addMessage(userMessage);
    setInput('');

    // Prepare messages for API
    const validMessages = [...messages, userMessage].filter((msg) => msg.content && msg.role);

    try {
      // Estimate tokens before sending
      const estimatedTokens = input.length / 4;
      console.log(`Estimated tokens: ${estimatedTokens}`);

      // Client-side validation first
      if (estimatedTokens > 600) {
        // MAX_INPUT_TOKENS
        toast.error('Your message is too long. Please shorten it a bit.');
        setLoading(false);
        return;
      }

      // First, save the user message to ensure a chat exists
      const saveResponse = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error('Failed to save user message:', errorData);
        throw new Error(errorData.error || 'Failed to save message');
      }

      // Then proceed with the chat request
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: validMessages }),
      });

      const data = await chatResponse.json();

      // Improved error handling
      if (!chatResponse.ok) {
        console.log('Error response:', { status: chatResponse.status, data });

        if (data.errorType === 'message_too_long') {
          toast.error('Your message is too long. Please shorten it a bit.');
          setLoading(false);
          return;
        } else if (data.errorType === 'monthly_limit_exceeded') {
          toast.error(
            "You've reached your monthly token limit. Try implementing some of the nutrition and fitness advice we've discussed!",
          );
          setLoading(false);
          return;
        }

        throw new Error(data.error || 'Failed to get AI response');
      }

      // Show warning if approaching token limit - make it persistent
      if (data.warning && data.warningLevel) {
        // Different toast styles based on warning level
        switch (data.warningLevel) {
          case 'critical':
            toast.error(data.warning, {
              duration: Infinity,
              dismissible: true,
            });
            break;
          case 'high':
            toast.warning(data.warning, {
              duration: Infinity,
              dismissible: true,
            });
            break;
          case 'medium':
            toast.warning(data.warning, {
              duration: Infinity,
              dismissible: true,
            });
            break;
          case 'low':
            toast.info(data.warning, {
              duration: Infinity,
              dismissible: true,
            });
            break;
          // Don't show any toast for 'none' or undefined warning levels
        }
      }

      if (data.error) throw new Error(data.error);

      // Check if the message content is empty
      if (!data.message?.content || !data.message.content.trim()) {
        toast.error('Received an empty response from the AI. Please try again.');
        throw new Error('Empty response from AI');
      }

      const assistantMessage: Message = {
        id: Date.now().toString(), // Generate a temporary client-side ID
        content: data.message.content,
        role: 'assistant',
        createdAt: new Date(),
      };

      // Set this message as the one being revealed in chunks
      // Only set the typing message ID if it's a valid string
      if (assistantMessage.id) {
        console.log('Setting typing message ID:', assistantMessage.id);
        setTypingMessageId(assistantMessage.id);
      } else {
        console.log('No valid ID for assistant message');
      }

      // Add the message to the UI
      addMessage(assistantMessage);

      // Save assistant message
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: assistantMessage }),
      });
    } catch (error: unknown) {
      console.error('Chat error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if the error is about input being too long
      if (errorMessage.includes('too long') || errorMessage.includes('under approximately')) {
        toast.error('Your message is too long. Please shorten it a bit.');
      } else {
        toast.error('Sorry, there was an error processing your request.');
        addMessage({
          content: 'Sorry, there was an error processing your request. Please try again.',
          role: 'assistant',
          createdAt: new Date(),
          id: `error-${Date.now()}`, // Use a string ID instead of false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitMessage();
  };

  // Keyboard event handler
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  if (isInitialLoading) {
    return (
      <div className='h-full p-4'>
        <Card className='h-full flex flex-col'>
          <div className='flex-1 overflow-y-auto p-4'>
            <Skeleton className='h-12 w-full mb-4' />
            <Skeleton className='h-12 w-full mb-4' />
            <Skeleton className='h-12 w-full mb-4' />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='h-full p-4 sm:p-4 px-0 sm:px-4 py-0 sm:py-4'>
      <Card className='h-full flex flex-col rounded-none sm:rounded-lg border-0 sm:border'>
        <div
          ref={messagesContainerRef}
          className={`flex-1 p-4 ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          {messages.length === 0 && (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center text-muted-foreground max-w-md'>
                <h3 className='text-lg font-semibold mb-2'>
                  Hey! I&apos;m your nutrition coach - dietlessAI
                </h3>
                <p>Ask me anything — from daily meal tips to long-term goals.</p>
              </div>
            </div>
          )}
          {messages.map((message, index) => {
            // Determine if this is the most recent assistant message
            const isLatestAssistantMessage =
              message.role === 'assistant' && message.id === typingMessageId;

            return (
              <div
                key={`${message.role}-${index}-${message.createdAt.getTime()}`}
                className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block p-3 rounded-lg text-left whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                    ) : isLatestAssistantMessage ? (
                      <ChunkReveal
                        content={message.content}
                        chunkDelay={500}
                        className='prose prose-sm max-w-none dark:prose-invert'
                        onComplete={() => {
                          console.log('Chunk reveal complete');
                          setTypingMessageId(null);
                        }}
                      />
                    ) : (
                      <div
                        className='whitespace-pre-wrap'
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                    )}
                  </div>
                  <div
                    className={`text-xs text-muted-foreground mt-1 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                    })}{' '}
                    {new Date(message.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className='flex justify-center p-4'>
              <div className='flex space-x-2'>
                <div className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce' />
                <div className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]' />
                <div className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]' />
              </div>
            </div>
          )}
          {/* Add this div as the last element in the messages container */}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className='border-t border-border p-4 rounded-t-lg'>
          <div className='flex items-center gap-2'>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Ask anything...'
              className='min-h-[40px] max-h-[96px] resize-none overflow-auto leading-[24px] py-2'
              disabled={isLoading}
            />
            <Button
              type='submit'
              size='icon'
              disabled={isLoading}
              className='h-10 w-10 shrink-0 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95'
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <SendHorizontal className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5' />
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ChatPage;






