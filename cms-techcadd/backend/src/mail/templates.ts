import { config } from '../config.js'
import type { Mail } from './mailer.js'

/** Escapes text going into the HTML body — a name is not markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const shell = (heading: string, body: string) => `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.6">
  <h1 style="font-size:18px;margin:0 0 12px">${escapeHtml(heading)}</h1>
  ${body}
  <p style="color:#64748b;font-size:12px;margin-top:24px">
    TechCADD CMS · this message was sent automatically, please do not reply.
  </p>
</div>`

export function passwordResetEmail(to: string, token: string): Mail {
  // The CMS origin, not the API's — the link opens the reset page in the app.
  const base = config.CORS_ORIGIN.split(',')[0]?.trim() ?? ''
  const link = `${base}/reset-password?token=${encodeURIComponent(token)}`

  const text = [
    'Someone asked to reset the password for this TechCADD CMS account.',
    '',
    `Open this link to choose a new one: ${link}`,
    '',
    'The link is valid for one hour and can be used once.',
    'If this was not you, no action is needed — the password is unchanged.',
  ].join('\n')

  return {
    to,
    subject: 'Reset your TechCADD CMS password',
    text,
    html: shell(
      'Reset your password',
      `<p>Someone asked to reset the password for this TechCADD CMS account.</p>
       <p style="margin:20px 0">
         <a href="${link}"
            style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;
                   text-decoration:none;display:inline-block">Choose a new password</a>
       </p>
       <p style="color:#475569;font-size:13px">
         The link is valid for one hour and can be used once. If this was not you,
         no action is needed — the password is unchanged.
       </p>`,
    ),
  }
}
