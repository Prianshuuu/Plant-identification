import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import User from "../models/User.js"

const getToken = (req) => {
  if (req.cookies?.token) return req.cookies.token
  const header = req.headers.authorization
  return header?.startsWith("Bearer ") ? header.slice(7) : null
}

async function userFromRequest(req) {
  const token = getToken(req)
  if (!token) return null
  try {
    const { id } = jwt.verify(token, env.jwtSecret)
    return await User.findById(id)
  } catch {
    return null
  }
}

/** Authentication: 401 unless a valid token maps to an existing user. */
export async function protect(req, res, next) {
  try {
    const user = await userFromRequest(req)
    if (!user) return res.status(401).json({ message: "Please sign in to continue." })
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email address to continue.",
        isUnverified: true,
      })
    }
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

/** Attaches req.user when signed in, but lets guests through. */
export async function optionalAuth(req, _res, next) {
  try {
    req.user = (await userFromRequest(req)) || undefined
    next()
  } catch (err) {
    next(err)
  }
}

/** Authorization: requires verified email. */
export function requireVerified(req, res, next) {
  if (!req.user?.isVerified) {
    return res.status(403).json({
      message: "Please verify your email address to perform this action.",
      isUnverified: true,
    })
  }
  next()
}

/** Authorization: use after protect(). */
export const restrictTo =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role) ? next() : res.status(403).json({ message: "You don't have permission to do that." })
