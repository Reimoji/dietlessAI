import { Resend } from 'resend';

// Check if the API key is set
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

// Initialize the Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

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
