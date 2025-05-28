'use client';

import { deleteAccount, deleteChatHistory, updatePassword } from '@/app/(login)/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamDataWithMembers, TeamMemberWithUser } from '@/lib/db/schema';
import { customerPortalAction } from '@/lib/payments/actions';
import { Loader2, Lock, Shredder, Trash2 } from 'lucide-react';
import { startTransition, useActionState, useEffect } from 'react';

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  const getUserDisplayName = (user: { id: number; name: string | null; email: string | null }) => {
    return user.name || user.email || 'Unknown User';
  };

  const [passwordState, passwordAction, isPasswordPending] = useActionState<ActionState, FormData>(
    updatePassword,
    { error: '', success: '' },
  );

  const [deleteState, deleteAction, isDeletePending] = useActionState<ActionState, FormData>(
    deleteAccount,
    { error: '', success: '' },
  );

  const [deleteChatState, deleteChatAction, isDeleteChatPending] = useActionState<
    ActionState,
    FormData
  >(deleteChatHistory, { error: '', success: '' });

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      passwordAction(new FormData(event.currentTarget));
    });
  };

  const handleDeleteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      deleteAction(new FormData(event.currentTarget));
    });
  };

  const handleDeleteChatSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      deleteChatAction(new FormData(event.currentTarget));
    });

    // Note: We'll need to move this inside a useEffect that watches deleteChatState.success
    // instead of doing it here directly
  };

  useEffect(() => {
    if (deleteChatState.success) {
      const form = document.getElementById('delete-chat-form') as HTMLFormElement;
      if (form) form.reset();
    }
  }, [deleteChatState.success]);

  return (
    <section className='flex-1 overflow-y-auto h-[calc(100vh-4rem)]'>
      {' '}
      {/* Adjust 4rem based on your header height */}
      <div className='p-4 lg:p-8'>
        <h1 className='text-lg lg:text-2xl font-medium mb-6'>User Settings</h1>

        {/* All your Card components wrapped in this div */}
        <div className='space-y-8'>
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>User Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex flex-col sm:flex-row justify-between'>
                  <div className='mb-4 sm:mb-0 sm:w-1/2 sm:self-start'>
                    <Label className='block mb-1'>
                      Current Plan: {teamData.planName || 'Free'}
                    </Label>
                    <div className='text-sm text-muted-foreground'>
                      {teamData.subscriptionStatus === 'active' && <p>Active subscription</p>}
                      {teamData.subscriptionStatus === 'trialing' && (
                        <p>Trial is currently active</p>
                      )}
                      {teamData.trialEndsAt && teamData.subscriptionStatus === 'trialing' && (
                        <p>
                          {new Date(teamData.trialEndsAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                      {teamData.nextBillingDate && (
                        <p>Next billing date: {teamData.nextBillingDate}</p>
                      )}
                      {teamData.subscriptionStatus === 'canceled' &&
                        teamData.subscriptionEndDate && (
                          <p>Access until: {teamData.subscriptionEndDate}</p>
                        )}
                    </div>
                  </div>
                  <div className='sm:ml-auto sm:w-1/3'>
                    <p className='text-sm text-muted-foreground mb-2'>
                      Manage your subscription, update payment methods, or change your plan.
                    </p>
                    <form action={customerPortalAction}>
                      <Button type='submit' variant='outline'>
                        Manage Subscription
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>User</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='space-y-4'>
                {teamData.teamMembers.map((member: TeamMemberWithUser) => (
                  <li key={member.id} className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32`}
                          alt={getUserDisplayName(member.user)}
                        />
                        <AvatarFallback>
                          {getUserDisplayName(member.user)
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>{getUserDisplayName(member.user)}</p>
                        <p className='text-sm text-muted-foreground capitalize'>{member.role}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form className='space-y-4' onSubmit={handlePasswordSubmit}>
                <div>
                  <Label htmlFor='current-password'>Current Password</Label>
                  <Input
                    id='current-password'
                    name='currentPassword'
                    type='password'
                    autoComplete='current-password'
                    required
                    minLength={8}
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor='new-password'>New Password</Label>
                  <Input
                    id='new-password'
                    name='newPassword'
                    type='password'
                    autoComplete='new-password'
                    required
                    minLength={8}
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor='confirm-password'>Confirm New Password</Label>
                  <Input
                    id='confirm-password'
                    name='confirmPassword'
                    type='password'
                    required
                    minLength={8}
                    maxLength={100}
                  />
                </div>
                {passwordState.error && (
                  <p className='text-red-500 text-sm'>{passwordState.error}</p>
                )}
                {passwordState.success && (
                  <p className='text-green-500 text-sm'>{passwordState.success}</p>
                )}
                <Button
                  type='submit'
                  className='bg-orange-500 hover:bg-orange-600 text-white'
                  disabled={isPasswordPending}
                >
                  {isPasswordPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className='mr-2 h-4 w-4' />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Chat History Section */}
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>Delete Chat History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-500 mb-4'>
                Chat history deletion is non-reversable. Please proceed with caution.
              </p>
              <form id='delete-chat-form' onSubmit={handleDeleteChatSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='delete-chat-password'>Confirm Password</Label>
                  <Input
                    id='delete-chat-password'
                    name='password'
                    type='password'
                    required
                    minLength={8}
                    maxLength={100}
                  />
                </div>
                {deleteChatState.error && (
                  <p className='text-red-500 text-sm'>{deleteChatState.error}</p>
                )}
                {deleteChatState.success && (
                  <p className='text-green-500 text-sm'>{deleteChatState.success}</p>
                )}
                <Button variant='destructive' type='submit' disabled={isDeleteChatPending}>
                  {isDeleteChatPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Shredder className='mr-2 h-4 w-4' />
                      Delete Chat History
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Account Section */}
          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-500 mb-4'>
                Account deletion is non-reversable. Please proceed with caution.
              </p>
              <form onSubmit={handleDeleteSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='delete-password'>Confirm Password</Label>
                  <Input
                    id='delete-password'
                    name='password'
                    type='password'
                    required
                    minLength={8}
                    maxLength={100}
                  />
                </div>
                {deleteState.error && <p className='text-red-500 text-sm'>{deleteState.error}</p>}
                <Button
                  type='submit'
                  variant='destructive'
                  className='bg-red-600 hover:bg-red-700'
                  disabled={isDeletePending}
                >
                  {isDeletePending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
