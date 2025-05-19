// Simple in-memory rate limiter for password reset requests
// In production, consider using Redis or a database for persistence across instances

type ResetAttempt = {
  lastAttempt: Date;
};

// Configuration
const COOLDOWN_MINUTES = 5;

// Store for tracking reset attempts
const resetAttempts = new Map<string, ResetAttempt>();

export function canRequestPasswordReset(email: string): {
  allowed: boolean;
  cooldownRemaining: number; // seconds remaining in cooldown
  nextAllowedTime: Date | null;
} {
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date();
  
  // Get last attempt for this email
  const lastAttempt = resetAttempts.get(normalizedEmail);
  
  // If no previous attempts, allow and record this attempt
  if (!lastAttempt) {
    resetAttempts.set(normalizedEmail, { lastAttempt: now });
    return { 
      allowed: true, 
      cooldownRemaining: 0, 
      nextAllowedTime: null 
    };
  }
  
  // Calculate time since last attempt in minutes
  const minutesSinceLastAttempt = (now.getTime() - lastAttempt.lastAttempt.getTime()) / (1000 * 60);
  
  // Check if cooldown period has passed
  if (minutesSinceLastAttempt >= COOLDOWN_MINUTES) {
    // Update last attempt time
    resetAttempts.set(normalizedEmail, { lastAttempt: now });
    return { 
      allowed: true, 
      cooldownRemaining: 0, 
      nextAllowedTime: null 
    };
  }
  
  // User is still in cooldown period
  const secondsRemaining = Math.ceil((COOLDOWN_MINUTES * 60) - (minutesSinceLastAttempt * 60));
  const nextAllowedTime = new Date(lastAttempt.lastAttempt.getTime() + (COOLDOWN_MINUTES * 60 * 1000));
  
  return { 
    allowed: false, 
    cooldownRemaining: secondsRemaining,
    nextAllowedTime: nextAllowedTime
  };
}

// Optional: Cleanup function to prevent memory leaks in long-running servers
export function cleanupExpiredAttempts() {
  const now = new Date();
  
  for (const [email, attempt] of resetAttempts.entries()) {
    const minutesSinceLastAttempt = (now.getTime() - attempt.lastAttempt.getTime()) / (1000 * 60);
    
    // Remove entries older than the cooldown period (they're no longer rate-limited)
    if (minutesSinceLastAttempt >= COOLDOWN_MINUTES) {
      resetAttempts.delete(email);
    }
  }
}

// Run cleanup periodically (e.g., every 15 minutes)
// In a production app, this would be better handled by a cron job or worker
setInterval(cleanupExpiredAttempts, 15 * 60 * 1000);