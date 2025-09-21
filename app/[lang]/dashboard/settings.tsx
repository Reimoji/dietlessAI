'use client';

import { deleteAccount, deleteChatHistory, updatePassword } from '@/app/[lang]/(login)/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamDataWithMembers, TeamMemberWithUser } from '@/lib/db/schema';
import { customerPortalAction } from '@/lib/payments/actions';
import { Loader2, Lock, Shredder, Trash2 } from 'lucide-react';
import { startTransition, useActionState, useEffect } from 'react';
import { Lang, t } from '@/lib/i18n';

type ActionState = {
  error?: string;
  success?: string;
};

const SUPPORTED_LANGS = ['en', 'et'] as const;

export function Settings({
  teamData,
  lang,
}: {
  teamData: TeamDataWithMembers;
  lang: string;
}) {
  const typedLang = (SUPPORTED_LANGS.includes(lang as Lang) ? lang : 'en') as Lang;

  const getUserDisplayName = (user: { id: number; name: string | null; email: string | null }) => {
    return user.name || user.email || t(typedLang, 'settings.unknown_user');
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

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      passwordAction(new FormData(event.currentTarget));
    });
  };

  const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      deleteAction(new FormData(event.currentTarget));
    });
  };

  const handleDeleteChatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      deleteChatAction(new FormData(event.currentTarget));
    });
  };

  useEffect(() => {
    if (deleteChatState.success) {
      const form = document.getElementById('delete-chat-form') as HTMLFormElement;
      if (form) form.reset();
    }
  }, [deleteChatState.success]);

  return (
    <section className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
      <div className="p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium mb-6">
          {t(typedLang, 'settings.title')}
        </h1>

        <div className="space-y-8">
          {/* Subscription card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t(typedLang, 'settings.subscription.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="mb-4 sm:mb-0 sm:w-1/2 sm:self-start">
                    <Label className="block mb-1">
                      {t(typedLang, 'settings.subscription.current_plan')}:{' '}
                      {teamData.planName || t(typedLang, 'settings.subscription.free')}
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      {teamData.subscriptionStatus === 'active' && (
                        <p>{t(typedLang, 'settings.subscription.active')}</p>
                      )}
                      {teamData.subscriptionStatus === 'trialing' && (
                        <p>{t(typedLang, 'settings.subscription.trial_active')}</p>
                      )}
                      {teamData.trialEndsAt && teamData.subscriptionStatus === 'trialing' && (
                        <p>
                          {new Date(teamData.trialEndsAt).toLocaleDateString(lang, {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                      {teamData.nextBillingDate && (
                        <p>
                          {t(typedLang, 'settings.subscription.next_billing')}:{' '}
                          {teamData.nextBillingDate}
                        </p>
                      )}
                      {teamData.subscriptionStatus === 'canceled' &&
                        teamData.subscriptionEndDate && (
                          <p>
                            {t(typedLang, 'settings.subscription.access_until')}:{' '}
                            {teamData.subscriptionEndDate}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="sm:ml-auto sm:w-1/3">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t(typedLang, 'settings.subscription.manage_hint')}
                    </p>
                    <form action={customerPortalAction}>
                      <input type="hidden" name="lang" value={lang} />
                      <Button type="submit" variant="outline">
                        {t(typedLang, 'settings.subscription.manage_button')}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User list */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t(typedLang, 'settings.user.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {teamData.teamMembers.map((member: TeamMemberWithUser) => (
                  <li key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
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
                        <p className="font-medium">{getUserDisplayName(member.user)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t(typedLang, 'settings.password.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                <div>
                  <Label htmlFor="current-password">
                    {t(typedLang, 'settings.password.current')}
                  </Label>
                  <Input id="current-password" name="currentPassword" type="password" required />
                </div>
                <div>
                  <Label htmlFor="new-password">
                    {t(typedLang, 'settings.password.new')}
                  </Label>
                  <Input id="new-password" name="newPassword" type="password" required />
                </div>
                <div>
                  <Label htmlFor="confirm-password">
                    {t(typedLang, 'settings.password.confirm')}
                  </Label>
                  <Input id="confirm-password" name="confirmPassword" type="password" required />
                </div>
                {passwordState.error && <p className="text-red-500 text-sm">{passwordState.error}</p>}
                {passwordState.success && (
                  <p className="text-green-500 text-sm">{passwordState.success}</p>
                )}
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isPasswordPending}
                >
                  {isPasswordPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t(typedLang, 'settings.password.updating')}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      {t(typedLang, 'settings.password.update_button')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Chat History */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t(typedLang, 'settings.delete_chat.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {t(typedLang, 'settings.delete_chat.warning')}
              </p>
              <form id="delete-chat-form" onSubmit={handleDeleteChatSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="delete-chat-password">
                    {t(typedLang, 'settings.delete_chat.confirm')}
                  </Label>
                  <Input id="delete-chat-password" name="password" type="password" required />
                </div>
                {deleteChatState.error && (
                  <p className="text-red-500 text-sm">{deleteChatState.error}</p>
                )}
                {deleteChatState.success && (
                  <p className="text-green-500 text-sm">{deleteChatState.success}</p>
                )}
                <Button variant="destructive" type="submit" disabled={isDeleteChatPending}>
                  {isDeleteChatPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t(typedLang, 'settings.delete_chat.deleting')}
                    </>
                  ) : (
                    <>
                      <Shredder className="mr-2 h-4 w-4" />
                      {t(typedLang, 'settings.delete_chat.button')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card>
            <CardHeader>
              <CardTitle>{t(typedLang, 'settings.delete_account.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {t(typedLang, 'settings.delete_account.warning')}
              </p>
              <form onSubmit={handleDeleteSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="delete-password">
                    {t(typedLang, 'settings.delete_account.confirm')}
                  </Label>
                  <Input id="delete-password" name="password" type="password" required />
                </div>
                {deleteState.error && <p className="text-red-500 text-sm">{deleteState.error}</p>}
                <Button
                  type="submit"
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeletePending}
                >
                  {isDeletePending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t(typedLang, 'settings.delete_account.deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t(typedLang, 'settings.delete_account.button')}
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
