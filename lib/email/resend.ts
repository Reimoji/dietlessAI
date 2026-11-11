import { Resend } from 'resend';

// Without an API key (e.g. demo deployments) emails are logged instead of sent.
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Basic email sending function
export async function sendEmail({
  to,
  subject,
  react,
  from = 'dietlessai@dietless.ai',
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
  from?: string;
}) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set, skipping email "${subject}" to ${to}`);
    return { success: true, data: null };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
