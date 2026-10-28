import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export const signToken = (user) => jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })

const cookieOptions = { httpOnly: true, sameSite: "lax", secure: env.isProd, path: "/" }

export const setAuthCookie = (res, token) => res.cookie("token", token, { ...cookieOptions, maxAge: WEEK_MS })
export const clearAuthCookie = (res) => res.clearCookie("token", cookieOptions)
