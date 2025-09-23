'use server';

import { validatedAction, validatedActionWithUser } from '@/lib/auth/middleware';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  activityLogs,
  ActivityType,
  chatMessages,
  chats,
  invitations,
  teamMembers,
  teams,
  tokenUsage,
  User,
  users,
  type NewActivityLog,
  type NewTeam,
  type NewTeamMember,
  type NewUser,
} from '@/lib/db/schema';
import {
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '@/lib/email/send-emails';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { canRequestPasswordReset } from '@/lib/rate-limiting/password-reset-limiter';
import { randomUUID } from 'crypto';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string,
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || '',
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    const lang = formData.get('lang') as string || 'en';
    return createCheckoutSession({ team: foundTeam, priceId, lang });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
});

async function initializeTokenUsage(userId: number) {
  const currentDate = new Date();
  const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  await db.insert(tokenUsage).values({
    userId,
    monthYear,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  });
}

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    role: 'owner', // Default role, will be overridden if there's an invitation
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
    };
  }

  // Send welcome email to the new user
  try {
    // Extract language from form or default to 'en'
    const lang = formData.get('lang') as string || 'en';
    await sendWelcomeEmail(email, lang);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Continue with sign-up process even if email fails
  }

  // Initialize token usage for the new user
  await initializeTokenUsage(createdUser.id);

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password };
    }
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`,
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password,
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole,
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    const lang = formData.get('lang') as string || 'en';
    return createCheckoutSession({ team: createdTeam, priceId, lang });
  }

  redirect('/dashboard');
});

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'New password must be different from the current password.',
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD),
    ]);

    // Send password changed confirmation email
    try {
      // For password change, we don't have lang from form, so we need to determine it
      // You could store user's preferred language in database or default to 'en'
      await sendPasswordChangedEmail(user.email, user.name || '', 'en'); // Default to 'en' for now
    } catch (error) {
      console.error('Failed to send password changed email:', error);
      // Continue even if email fails
    }

    return { success: 'Your password has been updated.' };
  },
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(deleteAccountSchema, async (data, _, user) => {
  const { password } = data;

  const isPasswordValid = await comparePasswords(password, user.passwordHash);
  if (!isPasswordValid) {
    return { error: 'Incorrect password. Account deletion failed.' };
  }

  const userWithTeam = await getUserWithTeam(user.id);

  await logActivity(userWithTeam?.teamId, user.id, ActivityType.DELETE_ACCOUNT);

  // Soft delete
  await db
    .update(users)
    .set({
      deletedAt: sql`CURRENT_TIMESTAMP`,
      email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
    })
    .where(eq(users.id, user.id));

  if (userWithTeam?.teamId) {
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, userWithTeam.teamId)));
  }

  (await cookies()).delete('session');
  redirect('/sign-in');
});

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const updateAccount = validatedActionWithUser(updateAccountSchema, async (data, _, user) => {
  const { name, email } = data;
  const userWithTeam = await getUserWithTeam(user.id);

  await Promise.all([
    db.update(users).set({ name, email }).where(eq(users.id, user.id)),
    logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT),
  ]);

  return { success: 'Account updated successfully.' };
});

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, userWithTeam.teamId)));

    await logActivity(userWithTeam.teamId, user.id, ActivityType.REMOVE_TEAM_MEMBER);

    return { success: 'Team member removed successfully' };
  },
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner']),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId)))
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending',
    });

    await logActivity(userWithTeam.teamId, user.id, ActivityType.INVITE_TEAM_MEMBER);

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  },
);

export const deleteChatHistory = validatedActionWithUser(
  z.object({
    password: z.string().min(8).max(100),
  }),
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Chat history deletion failed.' };
    }

    try {
      // Find all chat IDs for this user
      const userChats = await db
        .select({ id: chats.id })
        .from(chats)
        .where(eq(chats.userId, user.id));

      const chatIds = userChats.map((chat) => chat.id);

      // Only proceed if we found chats
      if (chatIds.length > 0) {
        // First, find all message IDs for these chats
        const chatMessageIds = await db
          .select({ id: chatMessages.id })
          .from(chatMessages)
          .where(inArray(chatMessages.chatId, chatIds));

        const messageIds = chatMessageIds.map((msg) => msg.id);

        // First delete records from token_logs that reference these messages
        if (messageIds.length > 0) {
          try {
            await db.execute(sql`
              DELETE FROM token_logs 
              WHERE message_id IN (${sql.join(messageIds, sql`, `)})
            `);
            console.log(`Deleted token logs for ${messageIds.length} messages`);
          } catch (tokenLogError) {
            console.error('Error deleting token logs:', tokenLogError);
          }
        }

        // Then delete all chat messages for all user's chats
        await db.delete(chatMessages).where(inArray(chatMessages.chatId, chatIds));
      }

      // Then delete all chats for this user
      await db.delete(chats).where(eq(chats.userId, user.id));

      await logActivity(
        (await getUserWithTeam(user.id))?.teamId,
        user.id,
        ActivityType.DELETE_CHAT_HISTORY,
      );

      return { success: 'Chat history deleted successfully' };
    } catch (error) {
      console.error('Error deleting chat history:', error);
      return { error: 'Failed to delete chat history. Please try again.' };
    }
  },
);

// Schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email().min(3).max(255),
});

// Store for password reset tokens
// In a production app, these should be stored in the database
// with an expiration timestamp
const passwordResetTokens = new Map<string, { email: string; expires: Date }>();

// Function to generate a password reset token
function generatePasswordResetToken(email: string, expirationMinutes = 30): string {
  const token = randomUUID();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + expirationMinutes);

  passwordResetTokens.set(token, { email, expires });
  return token;
}

// Action to handle forgot password requests
export const forgotPassword = validatedAction(forgotPasswordSchema, async (data, formData) => {
  const lang = formData.get('lang') as string || 'en';
  const { email } = data;

  // Check rate limiting
  const rateLimitCheck = canRequestPasswordReset(email);

  if (!rateLimitCheck.allowed) {
    // Format the remaining time in a user-friendly way
    const remainingSeconds = rateLimitCheck.cooldownRemaining;
    let timeMessage;

    if (remainingSeconds < 60) {
      timeMessage = `${remainingSeconds} seconds`;
    } else {
      const minutes = Math.ceil(remainingSeconds / 60);
      timeMessage = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    return {
      error: `Please wait ${timeMessage} before requesting another password reset link.`,
      success: '',
    };
  }

  // Check if user exists
  const userExists = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (userExists.length === 0) {
    // Don't reveal if email exists or not for security reasons
    return {
      success: 'If your email is registered, you will receive a password reset link.',
      error: '',
    };
  }

  // Generate reset token with 30 minute expiration
  const token = generatePasswordResetToken(email);
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;

  // Send password reset email
  try {
    // Since we don't have formData here, we'll default to 'en' for now
    // You could enhance this by storing user language preference in database
    const resetLink = `${process.env.BASE_URL}/en/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetLink, 30, 'en');
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { error: 'Failed to send password reset email. Please try again.', success: '' };
  }

  return {
    success: 'If your email is registered, you will receive a password reset link.',
    error: '',
  };
});

// Schema for password reset
const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Action to handle password reset
export const resetPassword = validatedAction(resetPasswordSchema, async (data) => {
  const { token, password } = data;

  console.log('Reset password attempt with token:', token);

  // Verify token
  const tokenData = passwordResetTokens.get(token);
  console.log('Token data found:', tokenData ? 'yes' : 'no');

  if (!tokenData) {
    console.log('Token not found in passwordResetTokens map');
    return {
      error: 'Invalid or expired reset token. Please request a new password reset link.',
      expired: false,
      success: '',
    };
  }

  // Check if token is expired
  if (new Date() > tokenData.expires) {
    passwordResetTokens.delete(token);
    return {
      error: 'This password reset link has expired. Please request a new one.',
      expired: true,
      success: '',
    };
  }

  const email = tokenData.email;

  // Find user
  const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (userResult.length === 0) {
    return {
      error: 'User not found. Please request a new password reset link.',
      expired: false,
      success: '',
    };
  }

  const user = userResult[0];

  // Update password
  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  // Remove used token
  passwordResetTokens.delete(token);

  // Return success
  return {
    success:
      'Your password has been reset successfully. You can now sign in with your new password.',
    error: '',
    expired: false,
  };
});
