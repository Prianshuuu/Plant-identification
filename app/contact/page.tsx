import { useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"
import { api, errorMessage, fieldError } from "@/lib/api"

export default function ContactPage() {
  usePageTitle("Contact us")
  const { user } = useAuth()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setBusy(true)
    setError(null)
    try {
      await api.post("/contact", Object.fromEntries(new FormData(form)))
      form.reset()
      toast({ title: "Message sent", description: "Thanks for getting in touch. We'll reply by email." })
    } catch (err) {
      setError(err)
      toast({ title: "Couldn't send your message", description: errorMessage(err), variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const field = (name: string, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-2">
      <Label htmlFor={`c-${name}`}>{label}</Label>
      <Input id={`c-${name}`} name={name} required {...props} />
      {fieldError(error, name) && <p className="text-sm text-destructive">{fieldError(error, name)}</p>}
    </div>
  )

  return (
    <section className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Contact us</CardTitle>
          <CardDescription>Questions, feedback or a plant you can't place? Send us a note.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" key={user?._id ?? "guest"}>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("name", "Name", { defaultValue: user?.name, autoComplete: "name" })}
              {field("email", "Email", { type: "email", defaultValue: user?.email, autoComplete: "email" })}
            </div>
            {field("subject", "Subject")}
            <div className="space-y-2">
              <Label htmlFor="c-message">Message</Label>
              <Textarea id="c-message" name="message" rows={6} required minLength={10} />
              {fieldError(error, "message") && <p className="text-sm text-destructive">{fieldError(error, "message")}</p>}
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send message
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
