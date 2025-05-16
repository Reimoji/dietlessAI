import * as React from 'react';

interface BaseEmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export const BaseEmailLayout: React.FC<BaseEmailLayoutProps> = ({
  children,
  previewText = 'Email from dietlessAI',
}) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>{previewText}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Base styles matching your app theme */
        body {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #222;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #F8F9FA;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #E9ECEF;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          border-top: 1px solid #E9ECEF;
          font-size: 12px;
          color: #6C757D;
        }
        .button {
          display: inline-block;
          background-color: #6366F1;
          color: #FFFFFF !important;
          font-weight: 500;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        h1, h2, h3 {
          color: #6366F1;
        }
        a {
          color: #6366F1;
          text-decoration: none;
        }
      `}} />
    </head>
    <body>
      <div className="container">
        <div className="header">
          <h1>dietlessAI</h1>
        </div>
        <div className="content">
          {children}
        </div>
        <div className="footer">
          <p>© {new Date().getFullYear()} dietlessAI. All rights reserved.</p>
          <p>
            This email was sent to you because you have an account with dietlessAI.
            If you have any questions, please contact us at <a href="mailto:dietlessai@dietless.ai">dietlessai@dietless.ai</a>
          </p>
        </div>
      </div>
    </body>
  </html>
);







