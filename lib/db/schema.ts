import { InferModel, relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Teams table
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
  stripeProductId: varchar('stripe_product_id', { length: 100 }),
  planName: varchar('plan_name', { length: 100 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  trialEndsAt: timestamp('trial_ends_at'),
  nextBillingDate: timestamp('next_billing_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Team members table
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// Invitations table
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// Chats table
export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.id),
  content: text('content').notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Token usage table (monthly aggregates)
export const tokenUsage = pgTable('token_usage', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  // Keep the original property name to avoid breaking existing code
  monthYear: varchar('month', { length: 7 }).notNull(), // Format: YYYY-MM
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Token logs table (detailed per-message logs) - NEW TABLE
export const tokenLogs = pgTable('token_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.id),
  messageId: integer('message_id')
    .notNull()
    .references(() => chatMessages.id),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations - keeping existing ones and adding new ones for tokenLogs
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  chats: many(chats),
  tokenUsage: many(tokenUsage),
  tokenLogs: many(tokenLogs), // NEW
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const chatsRelations = relations(chats, ({ many, one }) => ({
  messages: many(chatMessages),
  tokenLogs: many(tokenLogs), // NEW
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
  tokenLogs: many(tokenLogs), // NEW
}));

export const tokenUsageRelations = relations(tokenUsage, ({ one }) => ({
  user: one(users, {
    fields: [tokenUsage.userId],
    references: [users.id],
  }),
}));

// NEW - Token logs relations
export const tokenLogsRelations = relations(tokenLogs, ({ one }) => ({
  user: one(users, {
    fields: [tokenLogs.userId],
    references: [users.id],
  }),
  chat: one(chats, {
    fields: [tokenLogs.chatId],
    references: [chats.id],
  }),
  message: one(chatMessages, {
    fields: [tokenLogs.messageId],
    references: [chatMessages.id],
  }),
}));

// Type definitions - keeping existing ones
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Chat = InferModel<typeof chats>;
export type ChatMessage = InferModel<typeof chatMessages>;
export type TokenUsage = InferModel<typeof tokenUsage>;
export type NewTokenUsage = InferModel<typeof tokenUsage, 'insert'>;

// NEW - Token logs types
export type TokenLog = typeof tokenLogs.$inferSelect;
export type NewTokenLog = typeof tokenLogs.$inferInsert;

// Existing complex types - keeping exactly as they were
export type TeamMemberWithUser = {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  joinedAt: Date;
  user: {
    id: number;
    name: string | null;
    email: string; // Changed from string | null to string
  };
};

export type TeamDataWithMembers = {
  id: string;
  name: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeProductId?: string | null;
  planName?: string | null;
  subscriptionStatus?: string | null;
  trialEndsAt?: string | null;
  nextBillingDate?: string | null;
  subscriptionEndDate?: string | null;
  teamMembers: TeamMemberWithUser[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  DELETE_CHAT_HISTORY = 'DELETE_CHAT_HISTORY',
}
