import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { usePageTitle } from "@/hooks/use-page-title"

export default function NotFound() {
  usePageTitle("Page not found")
  return (
    <section className="container mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold">We couldn't find that page</h1>
      <p className="mt-3 text-muted-foreground">The link may be broken, or the page may have moved.</p>
      <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
        <Link to="/">Back to home</Link>
      </Button>
    </section>
  )
}
