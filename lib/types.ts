export interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin"
  avatar: string
  bio: string
  isVerified: boolean
  createdAt: string
}

export interface Post {
  _id: string
  title: string
  slug: string
  excerpt: string
  content?: string
  coverImage: string
  tags: string[]
  author?: { name: string; avatar: string }
  createdAt: string
}

export interface GardenPlant {
  _id: string
  commonName: string
  scientificName: string
  probability?: number
  imageUrl: string
  notes: string
  createdAt: string
}

export interface Suggestion {
  id: string
  name: string
  probability: number
  commonNames: string[]
  description: string
  wikiUrl: string
  image: string
}

export interface TrefleResult {
  id: number
  commonName: string | null
  scientificName: string
  family: string | null
  imageUrl: string | null
}

export interface ContactMessage {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}
