import nodemailer, { type Transporter } from 'nodemailer'

import { config, isProduction } from '../config.js'

export interface Mail {
  to: string
  subject: string
  text: string
  html: string
}

/**
 * SMTP is optional.
 *
 * Without credentials the CMS still runs — mail is written to the console
 * instead. That keeps local development working without a mail server, and
 * makes the absence obvious rather than silently dropping messages.
 */
const configured = Boolean(config.SMTP_HOST && config.SMTP_PORT)

let transporter: Transporter | undefined

function getTransporter(): Transporter | undefined {
  if (!configured) return undefined
  transporter ??= nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    // Port 465 is implicit TLS; everything else upgrades with STARTTLS.
    secure: config.SMTP_PORT === 465,
    auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } : undefined,
  })
  return transporter
}

export function isMailConfigured(): boolean {
  return configured
}

/**
 * Sends a message, or logs it when no SMTP server is configured.
 *
 * Never throws: a failure to send must not turn into a failed request. The
 * password-reset endpoint answers 204 whatever happens, so that an attacker
 * cannot use the response to learn which addresses exist.
 */
export async function send(mail: Mail): Promise<boolean> {
  const transport = getTransporter()

  if (!transport) {
    if (isProduction) {
      console.error(
        `Mail not sent — SMTP is not configured. Intended recipient: ${mail.to}, subject: ${mail.subject}`,
      )
    } else {
      console.log(`\n[mail] to: ${mail.to}\n[mail] subject: ${mail.subject}\n${mail.text}\n`)
    }
    return false
  }

  try {
    await transport.sendMail({ from: config.MAIL_FROM, ...mail })
    return true
  } catch (error) {
    console.error('Mail delivery failed:', error)
    return false
  }
}
