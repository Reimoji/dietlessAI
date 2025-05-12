import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { tokenUsage } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and, sql, desc } from 'drizzle-orm';
import { TOKEN_LIMITS } from '@/lib/tokens/config';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get current month in YYYY-MM format
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get current month's usage
    let currentMonthUsage = await db.query.tokenUsage.findFirst({
      where: and(
        eq(tokenUsage.userId, userId),
        eq(tokenUsage.monthYear, currentMonthYear)
      ),
    });
    
    // If no record exists for current month, create one
    if (!currentMonthUsage) {
      const [newUsage] = await db.insert(tokenUsage)
        .values({
          userId,
          monthYear: currentMonthYear,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        })
        .returning();
        
      currentMonthUsage = newUsage;
    }
    
    // Get total usage across all months
    const totalUsageResult = await db
      .select({
        totalInputTokens: sql`sum(${tokenUsage.inputTokens})`,
        totalOutputTokens: sql`sum(${tokenUsage.outputTokens})`,
        totalTokens: sql`sum(${tokenUsage.totalTokens})`,
      })
      .from(tokenUsage)
      .where(eq(tokenUsage.userId, userId));
      
    const totalUsage = totalUsageResult[0];
    
    // Get monthly history (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyUsage = await db.query.tokenUsage.findMany({
      where: eq(tokenUsage.userId, userId),
      orderBy: [desc(tokenUsage.monthYear)],
      limit: 6,
    });
    
    // Calculate remaining tokens
    const usedTokens = currentMonthUsage?.totalTokens || 0;
    const remainingTokens = Math.max(0, TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT - usedTokens);
    const percentUsed = Math.round((usedTokens / TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT) * 100);

    // Check if user is approaching limit - use the same thresholds as in the checkTokenLimits function
    const isApproachingLimit = 
      usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.FIRST;

    // Check if user has exceeded limit
    const hasExceededLimit = usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT;

    // Determine warning level
    let warningLevel = 'none';
    if (hasExceededLimit) {
      warningLevel = 'exceeded';
    } else if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.CRITICAL) {
      warningLevel = 'critical';
    } else if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.THIRD) {
      warningLevel = 'high';
    } else if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.SECOND) {
      warningLevel = 'medium';
    } else if (usedTokens >= TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT * TOKEN_LIMITS.WARNING_THRESHOLDS.FIRST) {
      warningLevel = 'low';
    }

    return NextResponse.json({
      stats: {
        currentMonth: {
          inputTokens: currentMonthUsage?.inputTokens || 0,
          outputTokens: currentMonthUsage?.outputTokens || 0,
          totalTokens: currentMonthUsage?.totalTokens || 0,
        },
        total: {
          totalInputTokens: totalUsage?.totalInputTokens || 0,
          totalOutputTokens: totalUsage?.totalOutputTokens || 0,
          totalTokens: totalUsage?.totalTokens || 0,
        },
        monthly: monthlyUsage.map(month => ({
          month: month.monthYear,
          inputTokens: month.inputTokens,
          outputTokens: month.outputTokens,
          totalTokens: month.totalTokens,
        })),
        limit: TOKEN_LIMITS.DEFAULT_MONTHLY_LIMIT,
        remaining: remainingTokens,
        isApproachingLimit,
        hasExceededLimit,
        warningLevel,
        percentUsed,
      }
    });
  } catch (error: any) {
    console.error('Token usage API error:', error);
    return NextResponse.json(
      { error: `Failed to retrieve token usage: ${error.message}` },
      { status: 500 }
    );
  }
}




