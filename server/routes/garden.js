import { Router } from "express"
import { z } from "zod"
import GardenPlant from "../models/GardenPlant.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { protect } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { gardenUpload, publicUploadPath, removeUpload } from "../middleware/upload.js"

const router = Router()
router.use(protect)

// Multipart fields arrive as strings, hence coerce
const plantSchema = z.object({
  commonName: z.string().trim().max(120).optional().default(""),
  scientificName: z.string().trim().min(1, "Scientific name is required").max(160),
  probability: z.coerce.number().min(0).max(1).optional(),
  notes: z.string().trim().max(500).optional().default(""),
})

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const plants = await GardenPlant.find({ user: req.user._id }).sort("-createdAt")
    res.json({ plants })
  }),
)

// multipart/form-data, optional field "image"
router.post(
  "/",
  gardenUpload,
  validate(plantSchema),
  asyncHandler(async (req, res) => {
    const plant = await GardenPlant.create({
      ...req.body,
      user: req.user._id,
      imageUrl: req.file ? publicUploadPath("garden", req.file) : "",
    })
    res.status(201).json({ plant })
  }),
)

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const plant = await GardenPlant.findById(req.params.id)
    if (!plant) return res.status(404).json({ message: "Plant not found." })
    // Ownership check: only the owner (or an admin) may delete
    if (!plant.user.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to do that." })
    }
    await plant.deleteOne()
    await removeUpload(plant.imageUrl)
    res.status(204).end()
  }),
)

export default router
