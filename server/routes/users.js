import { Router } from "express"
import { z } from "zod"
import { asyncHandler } from "../utils/asyncHandler.js"
import { protect } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { avatarUpload, publicUploadPath, removeUpload } from "../middleware/upload.js"

const router = Router()
router.use(protect)

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  bio: z.string().trim().max(300, "Keep your bio under 300 characters").optional().default(""),
})

router.patch(
  "/me",
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    req.user.name = req.body.name
    req.user.bio = req.body.bio
    await req.user.save()
    res.json({ user: req.user })
  }),
)

// multipart/form-data, field name: "avatar"
router.put(
  "/me/avatar",
  avatarUpload,
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Choose an image to upload." })
    const previous = req.user.avatar
    req.user.avatar = publicUploadPath("avatars", req.file)
    await req.user.save()
    await removeUpload(previous)
    res.json({ user: req.user })
  }),
)

export default router
