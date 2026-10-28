// npm run seed: creates the admin account and a few starter blog posts
import mongoose from "mongoose"
import { env } from "./config/env.js"
import { connectDB } from "./config/db.js"
import User from "./models/User.js"
import Post from "./models/Post.js"
import { slugify } from "./utils/slugify.js"

const password = process.env.ADMIN_PASSWORD
if (!env.adminEmail || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env first.")
  process.exit(1)
}

await connectDB()

let admin = await User.findOne({ email: env.adminEmail })
if (!admin) {
  admin = await User.create({ name: "PlantID Admin", email: env.adminEmail, password, role: "admin", isVerified: true })
  console.log(`Created admin ${admin.email}`)
} else {
  if (!admin.isVerified) {
    admin.isVerified = true
    await admin.save()
  }
  console.log(`Admin ${admin.email} already exists (verified: ${admin.isVerified})`)
}

if ((await Post.countDocuments()) === 0) {
  const posts = [
    ["How often should you water houseplants?", "Skip the fixed schedule. Check the soil, the pot and the season instead.", "Most houseplants fail from too much water, not too little. Push a finger two inches into the soil: if it feels dry, water thoroughly until it drains, then empty the saucer. Plants in bright light and warm rooms dry out faster, and nearly everything needs less water in winter.", ["watering", "indoor"]],
    ["Reading light: what bright, indirect actually means", "A simple shadow test tells you more than a light meter.", "Hold your hand a foot above a leaf. A sharp, dark shadow means direct light, a soft-edged shadow means bright indirect light, and a barely visible shadow means low light. Match the plant to the spot, not the other way round.", ["light", "indoor"]],
    ["Treating common pests without harsh chemicals", "Spider mites, aphids and fungus gnats each have a gentle fix.", "Isolate the plant first. Wipe leaves with diluted soapy water for mites and aphids, and let the top of the soil dry out between waterings to break the fungus gnat cycle. Repeat weekly for a month, since eggs survive the first treatment.", ["pests"]],
  ]
  await Post.insertMany(posts.map(([title, excerpt, content, tags]) => ({ title, excerpt, content, tags, slug: slugify(title), author: admin._id })))
  console.log("Created 3 starter posts")
}

await mongoose.connection.close()
