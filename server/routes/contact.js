import { Router } from "express"
import rateLimit from "express-rate-limit"
import { z } from "zod"
import Message from "../models/Message.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { protect, restrictTo } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = Router()

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "You've sent several messages already. Please try again later." },
})

const messageSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  subject: z.string().trim().min(3, "Add a subject").max(120),
  message: z.string().trim().min(10, "Write at least 10 characters").max(2000),
})

router.post(
  "/",
  limiter,
  validate(messageSchema),
  asyncHandler(async (req, res) => {
    await Message.create(req.body)
    res.status(201).json({ message: "Thanks, we've received your message." })
  }),
)

router.get(
  "/",
  protect,
  restrictTo("admin"),
  asyncHandler(async (_req, res) => {
    const messages = await Message.find().sort("-createdAt").limit(50)
    res.json({ messages })
  }),
)

router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    await Message.findByIdAndDelete(req.params.id)
    res.status(204).end()
  }),
)

export default router
