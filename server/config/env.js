import dotenv from "dotenv"

dotenv.config({ path: [".env.local", ".env"] })

const e = process.env

for (const key of ["MONGODB_URI", "JWT_SECRET"]) {
  if (!e[key]) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

export const env = {
  port: Number(e.PORT) || 5000,
  nodeEnv: e.NODE_ENV || "development",
  isProd: e.NODE_ENV === "production",
  mongoUri: e.MONGODB_URI,
  jwtSecret: e.JWT_SECRET,
  jwtExpiresIn: e.JWT_EXPIRES_IN || "7d",
  clientUrl: e.CLIENT_URL || "http://localhost:5173",
  adminEmail: (e.ADMIN_EMAIL || "").trim().toLowerCase(),
  // Plant identification & botanical search keys
  plantNetKey: (e.PLANTNET_API_KEY || e.PLANT_NET_API_KEY || (e.PLANTID_API_KEY?.startsWith("2b10") ? e.PLANTID_API_KEY : "") || "").trim(),
  plantIdKey: (!e.PLANTID_API_KEY?.startsWith("2b10") ? (e.PLANTID_API_KEY || e.PLANT_ID_API_KEY || "") : "").trim(),
  trefleToken: (e.TREFLE_API_TOKEN || e.TREFLE_API_KEY || e.TREFLE_TOKEN || "").trim(),
  // Email / SMTP settings
  smtpHost: e.SMTP_HOST || "",
  smtpPort: Number(e.SMTP_PORT) || 587,
  smtpSecure: e.SMTP_SECURE === "true" || e.SMTP_PORT === "465",
  smtpUser: e.SMTP_USER || "",
  smtpPass: e.SMTP_PASS || "",
  smtpService: e.SMTP_SERVICE || "",
  emailFrom: e.EMAIL_FROM || "PlantID <no-reply@plantid.app>",
}
