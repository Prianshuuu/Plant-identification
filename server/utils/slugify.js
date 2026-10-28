import crypto from "crypto"

export function slugify(text) {
  const base = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 60)
  return `${base || "post"}-${crypto.randomBytes(3).toString("hex")}`
}
