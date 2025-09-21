'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChunkReveal } from '@/components/ui/chunk-reveal';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatMessage } from '@/lib/format-message';
import { useChatStore } from '@/lib/stores/chat';
import { Loader2, SendHorizontal } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Lang, t } from '@/lib/i18n';

interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

function SubscriptionRequired({ lang }: { lang: Lang }) {
  const router = useRouter();

  return (
    <div className='h-full p-4'>
      <Card className='h-full flex flex-col items-center justify-center p-6'>
        <h2 className='text-2xl font-bold mb-4'>{t(lang, 'chat.subscription_required')}</h2>
        <p className='text-muted-foreground mb-6'>
          {t(lang, 'chat.subscription_message')}
        </p>
        <Button onClick={() => router.push(`/${lang}/pricing`)}>
          {t(lang, 'chat.view_pricing')}
        </Button>
      </Card>
    </div>
  );
}

function ChatPage() {
  // Detect language from pathname
  const pathname = usePathname();
  const SUPPORTED_LANGS = ['en', 'et'] as const;
  const langFromPath = pathname?.split('/')[1] as Lang | undefined;
  const lang = (SUPPORTED_LANGS.includes(langFromPath as Lang) ? langFromPath : 'en') as Lang;

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

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (!isInitialLoading) {
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialLoading]);

  // Load messages
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

  // Typing indicator
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

  if (hasSubscription === false) {
    return <SubscriptionRequired lang={lang} />;
  }

  const submitMessage = async () => {
    if (!input.trim() || isLoading) return;

    setLoading(true);

    const userMessage = {
      content: input,
      role: 'user' as const,
      createdAt: new Date(),
    };
    addMessage(userMessage);
    setInput('');

    const validMessages = [...messages, userMessage].filter((msg) => msg.content && msg.role);

    try {
      const estimatedTokens = input.length / 4;
      if (estimatedTokens > 600) {
        toast.error(t(lang, 'chat.error_too_long'));
        setLoading(false);
        return;
      }

      const saveResponse = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save message');
      }

      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: validMessages }),
      });

      const data = await chatResponse.json();

      if (!chatResponse.ok) {
        if (data.errorType === 'message_too_long') {
          toast.error(t(lang, 'chat.error_too_long'));
          setLoading(false);
          return;
        } else if (data.errorType === 'monthly_limit_exceeded') {
          toast.error(t(lang, 'chat.error_limit_exceeded'));
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to get AI response');
      }

      if (data.warning && data.warningLevel) {
        switch (data.warningLevel) {
          case 'critical':
            toast.error(data.warning, { duration: Infinity, dismissible: true });
            break;
          case 'high':
          case 'medium':
            toast.warning(data.warning, { duration: Infinity, dismissible: true });
            break;
          case 'low':
            toast.info(data.warning, { duration: Infinity, dismissible: true });
            break;
        }
      }

      if (data.error) throw new Error(data.error);

      if (!data.message?.content || !data.message.content.trim()) {
        toast.error(t(lang, 'chat.error_empty_response'));
        throw new Error('Empty response from AI');
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.message.content,
        role: 'assistant',
        createdAt: new Date(),
      };

      if (assistantMessage.id) setTypingMessageId(assistantMessage.id);

      addMessage(assistantMessage);

      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: assistantMessage }),
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('too long')) {
        toast.error(t(lang, 'chat.error_too_long'));
      } else {
        toast.error(t(lang, 'chat.error_generic'));
        addMessage({
          content: t(lang, 'chat.error_generic'),
          role: 'assistant',
          createdAt: new Date(),
          id: `error-${Date.now()}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitMessage();
  };

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
    <div className='h-full p-4 sm:p-4 px-0 sm:px-4 py-0 sm:py-4 overflow-x-hidden'>
      <Card className='h-full flex flex-col rounded-none sm:rounded-lg border-0 sm:border overflow-hidden'>
        <div
          ref={messagesContainerRef}
          className={`flex-1 p-4 ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'} overflow-x-hidden`}
        >
          {messages.length === 0 && (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center text-muted-foreground max-w-md'>
                <h3 className='text-lg font-semibold mb-2'>
                  {t(lang, 'chat.empty_title')}
                </h3>
                <p>{t(lang, 'chat.empty_subtitle')}</p>
              </div>
            </div>
          )}
          {messages.map((message, index) => {
            const isLatestAssistantMessage =
              message.role === 'assistant' && message.id === typingMessageId;

            const messageContent =
              message.role === 'user' || isLatestAssistantMessage
                ? message.content
                : formatMessage(message.content);

            return (
              <div
                key={`${message.role}-${index}-${message.createdAt.getTime()}`}
                className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
              >
                <div
                  className={`${
                    message.role === 'user'
                      ? 'max-w-[95%] sm:max-w-[90%] md:max-w-[85%] ml-auto'
                      : 'w-full sm:max-w-[95%] md:max-w-[90%] ml-0'
                  }`}
                >
                  <div
                    className={`p-3 sm:p-4 rounded-lg text-left whitespace-pre-wrap ${
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
                        onComplete={() => setTypingMessageId(null)}
                        preFormatted={false}
                      />
                    ) : (
                      <div
                        className='whitespace-pre-wrap'
                        dangerouslySetInnerHTML={{ __html: messageContent }}
                      />
                    )}
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
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className='border-t border-border p-4 rounded-t-lg'>
          <div className='flex items-center gap-2'>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t(lang, 'chat.placeholder')}
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
