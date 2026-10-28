import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import helmet from "helmet"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import { env } from "./config/env.js"
import { UPLOAD_ROOT } from "./middleware/upload.js"
import { notFound, errorHandler } from "./middleware/error.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import plantIdRoutes from "./routes/plantid.js"
import trefleRoutes from "./routes/trefle.js"
import gardenRoutes from "./routes/garden.js"
import postRoutes from "./routes/posts.js"
import contactRoutes from "./routes/contact.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, "../dist")

const app = express()
if (env.isProd) app.set("trust proxy", 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // Suggestion photos come from Plant.id / Trefle CDNs
        "img-src": ["'self'", "data:", "blob:", "https:"],
      },
    },
  }),
)
app.use(cors({ origin: env.clientUrl, credentials: true }))
if (!env.isProd) app.use(morgan("dev"))
app.use(express.json({ limit: "100kb" }))
app.use(cookieParser())

app.use("/uploads", express.static(UPLOAD_ROOT, { maxAge: "7d", index: false }))

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }))
app.get("/api/health", (_req, res) => res.json({ ok: true }))
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/plantid", plantIdRoutes)
app.use("/api/trefle", trefleRoutes)
app.use("/api/garden", gardenRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api", notFound)

// In production Express also serves the built React app
if (env.isProd) {
  app.use(express.static(distDir))
  app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")))
}

app.use(errorHandler)

export default app
