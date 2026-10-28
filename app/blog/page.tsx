import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"
import { api, errorMessage, fieldError } from "@/lib/api"
import type { Post } from "@/lib/types"

const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })

export default function BlogPage() {
  usePageTitle("Plant care blog")
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === "admin"

  const [posts, setPosts] = useState<Post[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [reading, setReading] = useState<Post | null>(null)
  const [composing, setComposing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(() => {
    setFailed(false)
    api.get<{ posts: Post[] }>("/posts?limit=12").then((r) => setPosts(r.posts)).catch(() => { setPosts([]); setFailed(true) })
  }, [])
  useEffect(load, [load])

  async function open(p: Post) {
    setReading(p) // show the summary immediately, then fill in the full text
    try {
      const r = await api.get<{ post: Post }>(`/posts/${p.slug}`)
      setReading(r.post)
    } catch (e) {
      toast({ title: "Couldn't load the full article", description: errorMessage(e), variant: "destructive" })
    }
  }

  async function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const form = new FormData(e.currentTarget)
      if (!(form.get("cover") as File)?.size) form.delete("cover")
      await api.upload("/posts", form)
      setComposing(false)
      toast({ title: "Post published" })
      load()
    } catch (err) {
      setError(err)
      toast({ title: "Couldn't publish", description: errorMessage(err), variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  async function remove(p: Post) {
    if (!window.confirm(`Delete “${p.title}”?`)) return
    try {
      await api.delete(`/posts/${p._id}`)
      setPosts((prev) => prev?.filter((x) => x._id !== p._id) ?? null)
    } catch (err) {
      toast({ title: "Couldn't delete post", description: errorMessage(err), variant: "destructive" })
    }
  }

  return (
    <section className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Plant care blog</h1>
          <p className="mt-2 text-muted-foreground">Practical guides for watering, light, pests and more.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setComposing(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" />New post
          </Button>
        )}
      </div>

      {posts === null ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>
      ) : failed ? (
        <p className="text-center text-muted-foreground">We couldn't load the posts. <button className="underline" onClick={load}>Try again</button></p>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts yet. {isAdmin ? "Use “New post” to publish the first one." : "Check back soon."}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Card key={p._id} className="flex flex-col overflow-hidden">
              {p.coverImage && <img src={p.coverImage} alt="" loading="lazy" className="h-44 w-full object-cover" />}
              <CardHeader className="flex-1">
                <div className="mb-1 flex flex-wrap gap-1">{p.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                <CardTitle className="text-xl">
                  <button className="text-left hover:text-emerald-600" onClick={() => open(p)}>{p.title}</button>
                </CardTitle>
                <CardDescription>{p.excerpt}</CardDescription>
              </CardHeader>
              <div className="flex items-center justify-between px-6 pb-4 text-xs text-muted-foreground">
                <span>{p.author?.name} · {fmt(p.createdAt)}</span>
                {isAdmin && <Button size="icon" variant="ghost" aria-label={`Delete ${p.title}`} onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!reading} onOpenChange={(o) => !o && setReading(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{reading?.title}</DialogTitle>
            <DialogDescription>{reading && `${reading.author?.name ?? "PlantID"} · ${fmt(reading.createdAt)}`}</DialogDescription>
          </DialogHeader>
          {reading?.coverImage && <img src={reading.coverImage} alt="" className="max-h-72 w-full rounded-lg object-cover" />}
          {reading?.content ? <p className="whitespace-pre-line leading-relaxed">{reading.content}</p> : <Skeleton className="h-32" />}
        </DialogContent>
      </Dialog>

      <Dialog open={composing} onOpenChange={setComposing}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New post</DialogTitle>
            <DialogDescription>Publishes immediately and is visible to everyone.</DialogDescription>
          </DialogHeader>
          <form onSubmit={publish} className="space-y-4">
            {(["title", "excerpt"] as const).map((f) => (
              <div key={f} className="space-y-2">
                <Label htmlFor={`post-${f}`}>{f === "title" ? "Title" : "Short summary"}</Label>
                <Input id={`post-${f}`} name={f} required />
                {fieldError(error, f) && <p className="text-sm text-destructive">{fieldError(error, f)}</p>}
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="post-content">Article</Label>
              <Textarea id="post-content" name="content" rows={8} required />
              {fieldError(error, "content") && <p className="text-sm text-destructive">{fieldError(error, "content")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-tags">Tags (comma separated, up to 5)</Label>
              <Input id="post-tags" name="tags" placeholder="watering, indoor" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-cover">Cover image (optional)</Label>
              <Input id="post-cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publish post
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
