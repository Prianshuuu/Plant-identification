import dns from "node:dns"
import nodemailer from "nodemailer"
import { env } from "../config/env.js"

let transporter = null
let isConfiguredSMTP = false
let cachedIps = ["192.178.158.109", "192.178.158.108", "142.250.185.108", "142.251.10.108"]

async function resolveGmailIps() {
  try {
    const res = await fetch("https://dns.google/resolve?name=smtp.gmail.com&type=A", { signal: AbortSignal.timeout(3000) })
    if (res.ok) {
      const data = await res.json()
      const ips = (data.Answer || []).filter((a) => a.type === 1).map((a) => a.data)
      if (ips.length > 0) {
        cachedIps = ips
        return ips
      }
    }
  } catch {
    // Fall back to cached IPs
  }
  return cachedIps
}

// Resilient resolver using DNS-over-HTTPS (DoH) so campus/router firewalls cannot block or hang DNS
function smartLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options
    options = {}
  }

  if (hostname === "smtp.gmail.com") {
    resolveGmailIps()
      .then((ips) => {
        const ip = ips[Math.floor(Math.random() * ips.length)]
        if (options?.all) {
          return callback(
            null,
            ips.map((addr) => ({ address: addr, family: 4 })),
          )
        }
        return callback(null, ip, 4)
      })
      .catch(() => {
        const fallback = cachedIps[0]
        if (options?.all) {
          return callback(null, [{ address: fallback, family: 4 }])
        }
        return callback(null, fallback, 4)
      })
    return
  }

  dns.lookup(hostname, options, callback)
}

function getTransporter() {
  if (transporter) return { mailer: transporter, isConfigured: isConfiguredSMTP }

  const cleanPass = (env.smtpPass || "").replace(/\s+/g, "")

  if (env.smtpService?.toLowerCase() === "gmail" || env.smtpHost?.includes("gmail.com")) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Uses STARTTLS (port 587) which works through firewalls that block port 465
      auth: {
        user: env.smtpUser,
        pass: cleanPass,
      },
      lookup: smartLookup,
      tls: {
        servername: "smtp.gmail.com",
      },
    })
    isConfiguredSMTP = true
  } else if (env.smtpHost && env.smtpUser && cleanPass) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: cleanPass,
      },
    })
    isConfiguredSMTP = true
  } else if (env.smtpService && env.smtpUser && cleanPass) {
    transporter = nodemailer.createTransport({
      service: env.smtpService,
      auth: {
        user: env.smtpUser,
        pass: cleanPass,
      },
    })
    isConfiguredSMTP = true
  } else {
    // Development / fallback: prints verification email and links directly to console
    isConfiguredSMTP = false
    transporter = {
      sendMail: async (mailOptions) => {
        console.log("\n========================================================")
        console.log("⚠️  [EMAIL NOT SENT - SMTP CREDENTIALS NOT CONFIGURED]")
        console.log("To send real emails to inboxes, set SMTP_USER and SMTP_PASS in .env")
        console.log("--------------------------------------------------------")
        console.log(`To: ${mailOptions.to}`)
        console.log(`Subject: ${mailOptions.subject}`)
        console.log("--------------------------------------------------------")
        console.log(mailOptions.text)
        console.log("========================================================\n")
        return { messageId: "mock-" + Date.now() }
      },
    }
  }

  return { mailer: transporter, isConfigured: isConfiguredSMTP }
}

export async function sendVerificationEmail({ to, name, token }) {
  const verificationUrl = `${env.clientUrl}/verify-email?token=${token}`
  const { mailer, isConfigured } = getTransporter()

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your PlantID account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { width: 100%; max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #059669; padding: 28px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
        .btn-container { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2); }
        .btn:hover { background-color: #047857; }
        .footer { font-size: 13px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        .link-text { word-break: break-all; color: #059669; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>🌿 PlantID</h1>
        </div>
        <div class="content">
          <p class="greeting">Hello ${name || "there"},</p>
          <p>Thank you for signing up with PlantID! To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
          
          <div class="btn-container">
            <a href="${verificationUrl}" target="_blank" class="btn">Verify My Email</a>
          </div>

          <p>Or paste this link into your browser:</p>
          <p><a href="${verificationUrl}" class="link-text">${verificationUrl}</a></p>

          <div class="footer">
            <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
            <p>If you didn't create a PlantID account, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `Hello ${name || "there"},\n\nThank you for signing up with PlantID!\n\nPlease verify your email address by opening the following link in your browser:\n${verificationUrl}\n\nThis verification link will expire in 24 hours.\nIf you did not sign up for PlantID, please ignore this email.`

  const info = await mailer.sendMail({
    from: env.emailFrom,
    to,
    subject: "Verify your email address - PlantID",
    text,
    html,
  })

  return {
    ...info,
    isMock: !isConfigured,
    verificationUrl,
  }
}
