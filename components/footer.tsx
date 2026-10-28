import { Link } from "react-router-dom"
import { Leaf } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <Leaf className="h-5 w-5 text-emerald-600" />
            PlantID
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Identify plants from a photo and learn how to keep them thriving.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-emerald-600" to="/search">Identify a plant</Link></li>
            <li><Link className="hover:text-emerald-600" to="/blog">Care guides</Link></li>
            <li><Link className="hover:text-emerald-600" to="/software">Software</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-emerald-600" to="/about">About</Link></li>
            <li><Link className="hover:text-emerald-600" to="/contact">Contact</Link></li>
            <li><Link className="hover:text-emerald-600" to="/profile">Your profile</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PlantID. All rights reserved.
      </div>
    </footer>
  )
}
