import { Database, Image as ImageIcon, KeyRound, Server } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/use-page-title"

// Placeholder copy: the original software page wasn't provided, so replace this with your own content.
const items = [
  { icon: ImageIcon, title: "Photo recognition", text: "Photos are sent securely to the Plant.id engine and are not stored unless you save a plant to your garden." },
  { icon: Database, title: "Plant database", text: "Name searches use the Trefle botanical database, with results cached to keep lookups fast." },
  { icon: Server, title: "REST API", text: "A Node.js and Express API backed by MongoDB powers accounts, your garden, the blog and contact messages." },
  { icon: KeyRound, title: "Secure sign-in", text: "Sessions use signed, httpOnly cookies and role-based access, so only admins can publish posts or read messages." },
]

export default function SoftwarePage() {
  usePageTitle("Software")
  return (
    <section className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold">Software</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">What powers PlantID behind the scenes.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Icon className="h-6 w-6" /></div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent><CardDescription>{text}</CardDescription></CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
