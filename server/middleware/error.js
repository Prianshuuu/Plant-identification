import fs from "fs"
import multer from "multer"
import { ZodError } from "zod"

export const notFound = (req, res) => res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // Don't leave orphaned uploads behind when a request fails after Multer ran
  if (req.file?.path) fs.unlink(req.file.path, () => {})

  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Please check the highlighted fields.", errors: err.flatten().fieldErrors })
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "That image is too large." : "The upload failed. Try a different image."
    return res.status(400).json({ message })
  }
  if (err.code === 11000) {
    const message = err.keyPattern?.email ? "That email is already registered." : "That value is already in use."
    return res.status(409).json({ message })
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id." })

  const status = err.status || 500
  if (status === 500) console.error(err)
  res.status(status).json({ message: status === 500 ? "Something went wrong on our side. Please try again." : err.message })
}
