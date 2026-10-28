import multer from "multer"
import path from "path"
import fs from "fs"
import crypto from "crypto"
import { fileURLToPath } from "url"

export const UPLOAD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads")

// Extension comes from the validated MIME type, never from the client's filename
const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }

const imageFilter = (_req, file, cb) => {
  if (EXT[file.mimetype]) return cb(null, true)
  cb(Object.assign(new Error("Only JPG, PNG or WebP images are allowed."), { status: 400 }))
}

function diskUploader(folder, maxMB) {
  const dir = path.join(UPLOAD_ROOT, folder)
  fs.mkdirSync(dir, { recursive: true })
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dir),
      filename: (_req, file, cb) => cb(null, crypto.randomBytes(16).toString("hex") + EXT[file.mimetype]),
    }),
    fileFilter: imageFilter,
    limits: { fileSize: maxMB * 1024 * 1024, files: 1 },
  })
}

export const avatarUpload = diskUploader("avatars", 2).single("avatar")
export const gardenUpload = diskUploader("garden", 5).single("image")
export const coverUpload = diskUploader("covers", 5).single("cover")

// Identification photos are forwarded to Plant.id and never touch the disk
export const identifyUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
}).single("image")

export const publicUploadPath = (folder, file) => `/uploads/${folder}/${file.filename}`

export async function removeUpload(publicPath) {
  if (!publicPath?.startsWith("/uploads/")) return
  const abs = path.resolve(UPLOAD_ROOT, publicPath.replace("/uploads/", ""))
  if (!abs.startsWith(UPLOAD_ROOT + path.sep)) return
  await fs.promises.unlink(abs).catch(() => {})
}
