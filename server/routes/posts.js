import { Router } from "express"
import { z } from "zod"
import Post from "../models/Post.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { slugify } from "../utils/slugify.js"
import { protect, restrictTo } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { coverUpload, publicUploadPath, removeUpload } from "../middleware/upload.js"

const router = Router()

const tags = z
  .string()
  .optional()
  .transform((s) => (s ? s.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5) : []))

const postSchema = z.object({
  title: z.string().trim().min(3, "Add a title").max(140),
  excerpt: z.string().trim().min(10, "Write a short summary").max(300),
  content: z.string().trim().min(30, "Write at least a few sentences"),
  tags,
})

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 9))
    const filter = typeof req.query.tag === "string" && req.query.tag ? { tags: req.query.tag } : {}

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .select("-content")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("author", "name avatar"),
      Post.countDocuments(filter),
    ])
    res.json({ posts, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
  }),
)

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug }).populate("author", "name avatar")
    if (!post) return res.status(404).json({ message: "Post not found." })
    res.json({ post })
  }),
)

// Admin only. multipart/form-data, optional field "cover"
router.post(
  "/",
  protect,
  restrictTo("admin"),
  coverUpload,
  validate(postSchema),
  asyncHandler(async (req, res) => {
    const post = await Post.create({
      ...req.body,
      slug: slugify(req.body.title),
      author: req.user._id,
      coverImage: req.file ? publicUploadPath("covers", req.file) : "",
    })
    res.status(201).json({ post })
  }),
)

router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  validate(postSchema.partial()),
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!post) return res.status(404).json({ message: "Post not found." })
    res.json({ post })
  }),
)

router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id)
    if (!post) return res.status(404).json({ message: "Post not found." })
    await removeUpload(post.coverImage)
    res.status(204).end()
  }),
)

export default router
