import { Router } from "express"
import { z } from "zod"
import { env } from "../config/env.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const router = Router()
const querySchema = z.object({ q: z.string().trim().min(2, "Type at least 2 characters").max(80) })

// Tiny in-memory cache: repeat searches don't burn Trefle quota
const cache = new Map()
const TTL = 10 * 60 * 1000

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!env.trefleToken) return res.status(503).json({ message: "Plant search isn't configured yet." })
    const { q } = querySchema.parse(req.query)
    const key = q.toLowerCase()

    const hit = cache.get(key)
    if (hit && hit.expires > Date.now()) return res.json({ results: hit.results })

    const url = new URL("https://trefle.io/api/v1/plants/search")
    url.searchParams.set("token", env.trefleToken)
    url.searchParams.set("q", q)

    const upstream = await fetch(url)
    if (!upstream.ok) return res.status(502).json({ message: "Plant search is unavailable right now." })

    const body = await upstream.json()
    const results = (body.data ?? []).slice(0, 12).map((p) => ({
      id: p.id,
      commonName: p.common_name ?? null,
      scientificName: p.scientific_name,
      family: p.family ?? null,
      imageUrl: p.image_url ?? null,
    }))

    if (cache.size > 200) cache.clear()
    cache.set(key, { results, expires: Date.now() + TTL })
    res.json({ results })
  }),
)

export default router
