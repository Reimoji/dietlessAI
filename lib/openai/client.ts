import { TOKEN_LIMITS } from '@/lib/tokens/config';
import { checkTokenLimits, logMessageTokens } from '@/lib/tokens/usage';
import { ChatResponse, OpenAIMessage } from 'lib/openai/types';
import OpenAI from 'openai';
import { systemPrompt } from './system-prompt';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use centralized token limits
export const MAX_INPUT_TOKENS = TOKEN_LIMITS.MAX_INPUT_TOKENS;
export const MAX_OUTPUT_TOKENS = TOKEN_LIMITS.MAX_OUTPUT_TOKENS;

export async function getChatCompletion(
  messages: OpenAIMessage[],
  includeSystemPrompt: boolean = false,
): Promise<ChatResponse> {
  try {
    // Convert messages to the correct type for OpenAI API
    const apiMessages = messages
      .filter((msg) => msg.content !== null && msg.content !== undefined)
      .map((msg) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content || '',
      }));

    // Add system prompt if requested
    const messagesWithSystem = includeSystemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...apiMessages]
      : apiMessages;

    // Check if we have any valid messages
    if (messagesWithSystem.length === 0) {
      return {
        content: '',
        role: 'assistant',
        error: 'No valid messages to process',
        errorType: null,
        refusal: null,
        annotations: [],
        usage: null,
      };
    }

    // Check if input exceeds token limit (rough estimate)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const estimatedInputTokens = lastMessage.content.length / 4;
      console.log(`Estimated tokens: ${estimatedInputTokens} (limit: ${MAX_INPUT_TOKENS})`);

      if (estimatedInputTokens > MAX_INPUT_TOKENS) {
        console.log(
          `Message too long: ~${estimatedInputTokens} tokens (limit: ${MAX_INPUT_TOKENS})`,
        );
        return {
          content: '',
          role: 'assistant',
          error: `Your message is too long. Please shorten it a bit.`,
          errorType: 'message_too_long',
          refusal: null,
          annotations: [],
          usage: null,
        };
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano-2025-04-14',
      messages: messagesWithSystem,
      store: true,
      temperature: 0.7,
      max_tokens: MAX_OUTPUT_TOKENS,
    });

    const message = completion.choices[0].message;
    // Check if the content is empty and provide a fallback response
    const content = message.content || '';
    if (!content.trim()) {
      return {
        content:
          "I'm sorry, I couldn't generate a response. Please try again or rephrase your question.",
        role: 'assistant',
        error: null,
        refusal: message.refusal || null,
        annotations: message.annotations || [],
        usage: completion.usage || null,
      };
    }

    return {
      content: content,
      role: 'assistant',
      error: null,
      refusal: message.refusal || null,
      annotations: message.annotations || [],
      usage: completion.usage || null,
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', {
      message: error.message,
      type: error.type,
      stack: error.stack,
      response: error.response,
    });

    return {
      content: '',
      role: 'assistant',
      error: `AI Error: ${error.message}`,
      refusal: null,
      annotations: [],
      usage: null,
    };
  }
}

// New function to handle token tracking while preserving existing functionality
export async function getChatCompletionWithTracking(
  messages: OpenAIMessage[],
  userId: number,
  chatId: number,
  messageId: number,
  includeSystemPrompt: boolean = false,
): Promise<
  ChatResponse & {
    limitExceeded?: boolean;
    warning?: string | null;
    warningLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical' | 'exceeded' | 'error';
  }
> {
  // First check if user has exceeded their token limits
  const limitCheck = await checkTokenLimits(userId);

  // If user has exceeded monthly limit, return error
  if (limitCheck.status === 'exceeded') {
    return {
      content: '',
      role: 'assistant',
      error:
        limitCheck.message ||
        "🚫 Oops! You've reached your chat limit for this month. But hey, no worries! Take this time to put DietlessAI's tips into practice, and you'll be back chatting in no time — your limit will reset at the start of next month! Keep crushing those nutrition and fitness goals in the meantime! 💪",
      errorType: 'monthly_limit_exceeded',
      refusal: null,
      annotations: [],
      usage: null,
      limitExceeded: true,
      warningLevel: 'exceeded',
    };
  }

  // Get the chat completion
  const response = await getChatCompletion(messages, includeSystemPrompt);

  // Log response usage data for debugging
  console.log('OpenAI response usage data:', {
    userId,
    chatId,
    messageId,
    usage: response.usage,
    hasError: !!response.error,
  });

  // If successful, log the token usage
  if (!response.error && response.usage) {
    try {
      await logMessageTokens(
        userId,
        response.usage.prompt_tokens,
        response.usage.completion_tokens,
        chatId,
        messageId,
      );
      console.log('Token usage logged successfully');
    } catch (error) {
      console.error('Error logging token usage:', error);
    }
  } else {
    console.log('No token usage to log:', {
      hasError: !!response.error,
      hasUsage: !!response.usage,
    });
  }

  // Return the response with any warnings
  return {
    ...response,
    warning: limitCheck.status === 'approaching' ? limitCheck.message : undefined,
    warningLevel: limitCheck.warningLevel,
  };
}
