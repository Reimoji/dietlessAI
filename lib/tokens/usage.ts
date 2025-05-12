import { db } from '@/lib/db/drizzle';
import { tokenUsage } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { TOKEN_LIMITS } from '@/lib/tokens/config';

// Function to log token usage for a message
export async function logMessageTokens(
  userId: number,
  inputTokens: number,
  outputTokens: number,
  chatId?: number,
  messageId?: number
) {
  try {
    console.log('Logging token usage:', { userId, inputTokens, outputTokens, chatId, messageId });
    
    // Get current month in YYYY-MM format
    const currentDate = new Date();
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    console.log('Month-year format:', monthYear);
    
    // Log to token_logs if chatId and messageId are provided
    if (chatId && messageId) {
      try {
        console.log('Inserting into token_logs:', { userId, chatId, messageId, inputTokens, outputTokens });
        await db.execute(sql`
          INSERT INTO token_logs (user_id, chat_id, message_id, input_tokens, output_tokens, total_tokens, created_at)
          VALUES (${userId}, ${chatId}, ${messageId}, ${inputTokens}, ${outputTokens}, ${inputTokens + outputTokens}, NOW())
        `);
        console.log('Successfully logged to token_logs table');
      } catch (logError) {
        console.error('Error logging to token_logs:', logError);
        console.error('Error details:', logError);
      }
    } else {
      console.warn('Skipping token_logs insert - missing chatId or messageId:', { chatId, messageId });
    }
    
    // Check if a record exists for this user and month
    const existingRecord = await db.query.tokenUsage.findFirst({
      where: and(
        eq(tokenUsage.userId, userId),
        eq(tokenUsage.monthYear, monthYear)
      ),
    });
    
    console.log('Existing record found:', existingRecord);
    
    const totalTokens = inputTokens + outputTokens;
    
    if (existingRecord) {
      // Update existing record
      const result = await db
        .update(tokenUsage)
        .set({
          inputTokens: existingRecord.inputTokens + inputTokens,
          outputTokens: existingRecord.outputTokens + outputTokens,
          totalTokens: existingRecord.totalTokens + totalTokens,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tokenUsage.userId, userId),
            eq(tokenUsage.monthYear, monthYear)
          )
        )
        .returning();
      
      console.log('Updated token usage record:', result);
    } else {
      // Create new record
      const result = await db.insert(tokenUsage).values({
        userId,
        monthYear,
        inputTokens,
        outputTokens,
        totalTokens,
        updatedAt: new Date(),
      }).returning();
      
      console.log('Created new token usage record:', result);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error logging token usage:', error);
    throw error; // Re-throw to ensure the calling function knows there was an error
  }
}

// Function to check if user has exceeded token limits
export async function checkTokenLimits(userId: number): Promise<{
  status: 'ok' | 'approaching' | 'exceeded' | 'error';
  usedTokens?: number;
  remainingTokens?: number;
  percentUsed?: number;
  message?: string;
  warningLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' | 'exceeded' | 'error';
}> {
  try {
    // Get current month in YYYY-MM format
    const currentDate = new Date();
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get current month's usage
    const currentMonthUsage = await db.query.tokenUsage.findFirst({
      where: and(
        eq(tokenUsage.userId, userId),
        eq(tokenUsage.monthYear, monthYear)
      ),
    });
    
    // If no record exists, user hasn't used any tokens this month
    if (!currentMonthUsage) {
      return { 
        status: 'ok',
        usedTokens: 0,
        remainingTokens: TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT,
        percentUsed: 0,
        message: undefined,
        warningLevel: 'none'
      };
    }
    
    const usedTokens = currentMonthUsage.totalTokens;
    const remainingTokens = Math.max(0, TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT - usedTokens);
    const percentUsed = Math.round((usedTokens / TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT) * 100);
    
    // Check if user has exceeded limit
    if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT) {
      return {
        status: 'exceeded',
        usedTokens,
        remainingTokens: 0,
        percentUsed: 100,
        warningLevel: 'exceeded',
        message: `Oops! You've hit your monthly limit. Don't worry — take this time to follow DietlessAI's tips and routines. Your limit will reset at the start of next month!`
      };
    }
    
    // Check for critical warning (99%)
    if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.CRITICAL) {
      return {
        status: 'approaching',
        usedTokens,
        remainingTokens,
        percentUsed,
        warningLevel: 'critical',
        message: `Almost there! You've used ${percentUsed}% of your monthly chat usage limit. Make the most of them! Your limit will reset at the start of next month.`
      };
    }
    
    // Check for third warning (95%)
    if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.THIRD) {
      return {
        status: 'approaching',
        usedTokens,
        remainingTokens,
        percentUsed,
        warningLevel: 'high',
        message: `Heads up! You've used ${percentUsed}% of your monthly chat usage limit. Your limit will reset next month!`
      };
    }
    
    // Check for second warning (90%)
    if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.SECOND) {
      return {
        status: 'approaching',
        usedTokens,
        remainingTokens,
        percentUsed,
        warningLevel: 'medium',
        message: `Just a quick update: You've used ${percentUsed}% of your monthly chat usage limit.`
      };
    }
    
    // Check for first warning (80%)
    if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.FIRST) {
      return {
        status: 'approaching',
        usedTokens,
        remainingTokens,
        percentUsed,
        warningLevel: 'low',
        message: `Friendly reminder: You've used ${percentUsed}% of your monthly limit. You’re still good to go — your limit will reset at the start of next month!`
      };
    }
    
    // User is within limits and below any warning threshold
    return {
      status: 'ok',
      usedTokens,
      remainingTokens,
      percentUsed,
      warningLevel: 'none',
      message: undefined
    };
  } catch (error) {
    console.error('Error checking token limits:', error);
    return { 
      status: 'error',
      warningLevel: 'error',
      message: 'Error checking token limits'
    };
  }
}


















