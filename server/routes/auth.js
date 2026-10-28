import { Router } from "express"
import rateLimit from "express-rate-limit"
import crypto from "crypto"
import { z } from "zod"
import User from "../models/User.js"
import { env } from "../config/env.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { signToken, setAuthCookie, clearAuthCookie } from "../utils/token.js"
import { sendVerificationEmail } from "../utils/email.js"
import { validate } from "../middleware/validate.js"
import { protect } from "../middleware/auth.js"

const router = Router()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again in a few minutes." },
})

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many verification requests. Please try again later." },
})

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters").max(100),
})
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
})
const resendSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
})

router.post(
  "/register",
  limiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const role = env.adminEmail && email === env.adminEmail ? "admin" : "user"

    // Generate secure verification token
    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires,
    })

    let mailResult = null
    let mailErrorMsg = null
    try {
      mailResult = await sendVerificationEmail({ to: user.email, name: user.name, token: rawToken })
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError)
      mailErrorMsg = mailError.message
    }

    const fallbackUrl = `${env.clientUrl}/verify-email?token=${rawToken}`

    res.status(201).json({
      message: mailErrorMsg
        ? `Account created! However, email delivery failed (${mailErrorMsg}). Use the link below to verify.`
        : mailResult?.isMock
        ? "Registration successful! (Notice: SMTP is not configured in .env, so check your server console for the link)."
        : "Registration successful! A verification email has been sent. Please check your inbox.",
      email: user.email,
      requiresVerification: true,
      devVerificationUrl: !env.isProd ? (mailResult?.verificationUrl || fallbackUrl) : undefined,
    })
  }),
)

// Email verification via GET (clicking link in email)
router.get(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const rawToken = req.query.token
    if (!rawToken || typeof rawToken !== "string") {
      return res.status(400).json({ message: "Verification token is required." })
    }

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token. Please request a new verification email." })
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    setAuthCookie(res, signToken(user))
    res.json({ message: "Your email has been successfully verified! You are now signed in.", user })
  }),
)

// Email verification via POST (from client-side verify page)
router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const rawToken = req.body.token || req.query.token
    if (!rawToken || typeof rawToken !== "string") {
      return res.status(400).json({ message: "Verification token is required." })
    }

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token. Please request a new verification email." })
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    setAuthCookie(res, signToken(user))
    res.json({ message: "Your email has been successfully verified! You are now signed in.", user })
  }),
)

// Resend verification email
router.post(
  "/resend-verification",
  resendLimiter,
  validate(resendSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })

    // Generic response if user not found to prevent account enumeration
    if (!user) {
      return res.json({ message: "If an account exists with this email, a verification link has been sent." })
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "This email address is already verified. You can sign in." })
    }

    const rawToken = crypto.randomBytes(32).toString("hex")
    user.verificationToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    let mailResult = null
    let mailErrorMsg = null
    try {
      mailResult = await sendVerificationEmail({ to: user.email, name: user.name, token: rawToken })
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError)
      mailErrorMsg = mailError.message
    }

    const fallbackUrl = `${env.clientUrl}/verify-email?token=${rawToken}`

    res.json({
      message: mailErrorMsg
        ? `Email delivery failed (${mailErrorMsg}). Use the link below to verify.`
        : mailResult?.isMock
        ? "Verification link generated! (Notice: SMTP is not configured in .env, so check your server console for the link)."
        : "A new verification email has been sent. Please check your inbox.",
      devVerificationUrl: !env.isProd ? (mailResult?.verificationUrl || fallbackUrl) : undefined,
    })
  }),
)

router.post(
  "/login",
  limiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select("+password")
    // Same message for unknown email and wrong password, so accounts can't be probed
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ message: "Incorrect email or password." })
    }

    // Require email verification before allowing sign in
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email address before signing in. Check your inbox for the verification link.",
        isUnverified: true,
        email: user.email,
      })
    }

    setAuthCookie(res, signToken(user))
    res.json({ user })
  }),
)

router.post("/logout", (_req, res) => {
  clearAuthCookie(res)
  res.json({ message: "Signed out." })
})

router.get("/me", protect, (req, res) => res.json({ user: req.user }))

export default router
