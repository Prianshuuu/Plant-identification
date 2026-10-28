import { Router } from "express"
import rateLimit from "express-rate-limit"
import { env } from "../config/env.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { optionalAuth } from "../middleware/auth.js"
import { identifyUpload } from "../middleware/upload.js"

const router = Router()

// Every call spends Plant.id credits: guests get a small hourly allowance, members more
const identifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (req.user ? 60 : 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Identification limit reached. Sign in for a higher limit, or try again later." },
})

const DETAILS = "common_names,url,description,taxonomy,image,watering,propagation_methods,edible_parts"

// multipart/form-data, field name: "image"
router.post(
  "/",
  optionalAuth,
  identifyLimiter,
  identifyUpload,
  asyncHandler(async (req, res) => {
    if (!env.plantNetKey && !env.plantIdKey) {
      return res.status(503).json({ message: "Plant identification isn't configured yet. Set PLANTNET_API_KEY in .env." })
    }
    if (!req.file) return res.status(400).json({ message: "Choose a photo to identify." })

    // If Pl@ntNet key is available (my-api.plantnet.org)
    if (env.plantNetKey) {
      const formData = new FormData()
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype || "image/jpeg" })
      formData.append("images", blob, req.file.originalname || "image.jpg")
      formData.append("organs", "auto")

      const upstream = await fetch(
        `https://my-api.plantnet.org/v2/identify/all?include-related-images=true&lang=en&api-key=${env.plantNetKey}`,
        {
          method: "POST",
          body: formData,
        },
      )

      if (!upstream.ok) {
        console.error("Pl@ntNet error", upstream.status, await upstream.text().catch(() => ""))
        if (upstream.status === 401 || upstream.status === 403) {
          return res.status(503).json({ message: "Pl@ntNet API key is invalid. Check PLANTNET_API_KEY in .env." })
        }
        const message = upstream.status === 429 ? "The identification service is busy. Try again shortly." : "We couldn't identify that photo. Try a clearer one."
        return res.status(502).json({ message })
      }

      const data = await upstream.json()
      const suggestions = (data.results ?? []).slice(0, 5).map((r, idx) => ({
        id: r.gbif?.id || String(idx),
        name: r.species?.scientificNameWithoutAuthor || r.species?.scientificName,
        probability: r.score,
        commonNames: r.species?.commonNames ?? [],
        description: [
          r.species?.family?.scientificName ? `Family: ${r.species.family.scientificName}` : null,
          r.species?.genus?.scientificName ? `Genus: ${r.species.genus.scientificName}` : null,
          r.species?.scientificNameAuthorship ? `Author: ${r.species.scientificNameAuthorship}` : null,
        ]
          .filter(Boolean)
          .join(" • "),
        wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.species?.scientificNameWithoutAuthor || r.species?.scientificName || "")}`,
        image: r.images?.[0]?.url?.m || r.images?.[0]?.url?.s || r.images?.[0]?.url?.o || "",
      }))

      return res.json({
        isPlant: data.results?.length > 0 ? (data.results[0].score > 0.05 ? 1 : data.results[0].score) : null,
        suggestions,
      })
    }

    // Fallback: Plant.id (Kindwise)
    const upstream = await fetch(`https://plant.id/api/v3/identification?details=${DETAILS}`, {
      method: "POST",
      headers: { "Api-Key": env.plantIdKey, "Content-Type": "application/json" },
      body: JSON.stringify({ images: [req.file.buffer.toString("base64")], similar_images: true }),
    })

    if (!upstream.ok) {
      console.error("Plant.id error", upstream.status, await upstream.text().catch(() => ""))
      if (upstream.status === 401 || upstream.status === 403) {
        return res.status(503).json({ message: "Plant identification is misconfigured. Check that PLANTID_API_KEY in .env is valid." })
      }
      const message = upstream.status === 429 ? "The identification service is busy. Try again shortly." : "We couldn't identify that photo. Try a clearer one."
      return res.status(502).json({ message })
    }

    const data = await upstream.json()
    const suggestions = (data.result?.classification?.suggestions ?? []).slice(0, 5).map((s) => ({
      id: s.id,
      name: s.name,
      probability: s.probability,
      commonNames: s.details?.common_names ?? [],
      description: s.details?.description?.value ?? "",
      wikiUrl: s.details?.url ?? "",
      image: s.similar_images?.[0]?.url ?? s.details?.image?.value ?? "",
    }))

    res.json({ isPlant: data.result?.is_plant?.probability ?? null, suggestions })
  }),
)

export default router
