import mongoose from "mongoose"
import { env } from "./env.js"

export async function connectDB(retries = 5, delay = 2500) {
  mongoose.set("strictQuery", true)
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 8000,
      })
      console.log(`MongoDB connected (${mongoose.connection.name})`)
      return
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed: ${err.message}`)
      if (i === retries - 1) throw err
      await new Promise((r) => setTimeout(r, delay))
    }
  }
}
