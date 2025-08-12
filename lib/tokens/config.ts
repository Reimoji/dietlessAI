// Central configuration for token limits
export const TOKEN_LIMITS = {
  // Default monthly token limit for all users
  DEFAULT_MONTHLY_LIMIT: 475000,

  // Warning thresholds (percentage of limit)
  WARNING_THRESHOLDS: {
    FIRST: 0.8, // 80%
    SECOND: 0.9, // 90%
    THIRD: 0.95, // 95%
    CRITICAL: 0.99, // 99%
  },

  // Maximum tokens per message
  MAX_INPUT_TOKENS: 600,
  MAX_OUTPUT_TOKENS: 1200,
};
