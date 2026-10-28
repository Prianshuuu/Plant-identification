import mongoose from "mongoose"
import app from "./app.js"
import { env } from "./config/env.js"
import { connectDB } from "./config/db.js"

await connectDB()
const server = app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port} (${env.nodeEnv})`))

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`)
  server.close(async () => {
    await mongoose.connection.close()
    process.exit(0)
  })
}
process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
