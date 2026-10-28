import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { usePageTitle } from "@/hooks/use-page-title"

const steps = [
  ["Snap a photo", "Take a clear picture of a leaf, flower or the whole plant."],
  ["Get matches", "Our recognition model compares it against a large botanical database and ranks the likely species."],
  ["Learn and care", "Read about the plant, save it to your garden and follow practical care guides."],
]

export default function AboutPage() {
  usePageTitle("About")
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold">About PlantID</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        PlantID helps people name the plants around them and look after the ones they bring home. We pair AI image
        recognition with a botanical database so you get an answer, and the context to act on it.
      </p>

      <h2 className="mt-12 text-2xl font-semibold">How it works</h2>
      <ol className="mt-4 space-y-4">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">{i + 1}</span>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-2xl font-semibold">A note on accuracy</h2>
      <p className="mt-2 text-muted-foreground">
        Identification is probabilistic. Treat a match as a strong lead, and never eat or handle a plant based on an app's
        answer alone, especially if you suspect it is toxic.
      </p>

      <div className="mt-10 flex gap-3">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700"><Link to="/search">Identify a plant</Link></Button>
        <Button asChild variant="outline"><Link to="/contact">Get in touch</Link></Button>
      </div>
    </section>
  )
}
