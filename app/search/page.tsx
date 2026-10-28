import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { BookmarkPlus, Camera, Check, ExternalLink, Leaf, Loader2, Search, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"
import { api, errorMessage } from "@/lib/api"
import type { Suggestion, TrefleResult } from "@/lib/types"

const MAX_MB = 8

export default function SearchPage() {
  usePageTitle("Identify a plant")
  const { user } = useAuth()
  const { toast } = useToast()
  const [params, setParams] = useSearchParams()
  const initialQ = params.get("q") ?? ""

  const [tab, setTab] = useState(initialQ ? "name" : "photo")

  // Photo identification
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [identifying, setIdentifying] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null)
  const [isPlant, setIsPlant] = useState<number | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  // Name search
  const [query, setQuery] = useState(initialQ)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<TrefleResult[] | null>(null)

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const runSearch = useCallback(
    async (q: string) => {
      setSearching(true)
      try {
        const r = await api.get<{ results: TrefleResult[] }>(`/trefle?q=${encodeURIComponent(q)}`)
        setResults(r.results)
      } catch (e) {
        setResults([])
        toast({ title: "Search failed", description: errorMessage(e), variant: "destructive" })
      } finally {
        setSearching(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (initialQ.length >= 2) runSearch(initialQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onPick(f: File | undefined) {
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) {
      toast({ title: "Photo is too large", description: `Choose an image under ${MAX_MB} MB.`, variant: "destructive" })
      return
    }
    setFile(f)
    setSuggestions(null)
    setSaved(new Set())
  }

  async function identify() {
    if (!file) return
    setIdentifying(true)
    try {
      const form = new FormData()
      form.append("image", file)
      const r = await api.upload<{ isPlant: number | null; suggestions: Suggestion[] }>("/plantid", form)
      setSuggestions(r.suggestions)
      setIsPlant(r.isPlant)
    } catch (e) {
      toast({ title: "Couldn't identify that photo", description: errorMessage(e), variant: "destructive" })
    } finally {
      setIdentifying(false)
    }
  }

  async function saveToGarden(s: Suggestion) {
    setSaving(s.id)
    try {
      const form = new FormData()
      form.append("scientificName", s.name)
      form.append("commonName", s.commonNames[0] ?? "")
      form.append("probability", String(s.probability))
      if (file) form.append("image", file)
      await api.upload("/garden", form)
      setSaved((prev) => new Set(prev).add(s.id))
      toast({ title: "Saved to your garden", description: s.commonNames[0] ?? s.name })
    } catch (e) {
      toast({ title: "Couldn't save plant", description: errorMessage(e), variant: "destructive" })
    } finally {
      setSaving(null)
    }
  }

  function onNameSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) return
    setParams({ q }, { replace: true })
    runSearch(q)
  }

  return (
    <section className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Identify a plant</h1>
        <p className="mt-2 text-muted-foreground">Upload a photo, or look a plant up by name.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mx-auto grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="photo"><Camera className="mr-2 h-4 w-4" />From a photo</TabsTrigger>
          <TabsTrigger value="name"><Search className="mr-2 h-4 w-4" />By name</TabsTrigger>
        </TabsList>

        <TabsContent value="photo" className="mt-8 space-y-8">
          <Card>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <label
                htmlFor="plant-photo"
                className="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed text-center hover:bg-muted/50"
              >
                {preview ? (
                  <img src={preview} alt="Your plant photo" className="h-full max-h-80 w-full object-cover" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-emerald-600" />
                    <span className="font-medium">Choose a photo</span>
                    <span className="text-sm text-muted-foreground">JPG, PNG or WebP, up to {MAX_MB} MB</span>
                  </>
                )}
                <input
                  id="plant-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => onPick(e.target.files?.[0])}
                />
              </label>
              <div className="flex flex-col justify-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Use a sharp, well-lit photo of a leaf, flower or the whole plant. One plant per photo works best.
                </p>
                <Button onClick={identify} disabled={!file || identifying} className="bg-emerald-600 hover:bg-emerald-700">
                  {identifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  {identifying ? "Identifying…" : "Identify plant"}
                </Button>
                {file && !identifying && (
                  <Button variant="ghost" onClick={() => { setFile(null); setSuggestions(null) }}>Remove photo</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {suggestions && (
            <div className="space-y-4">
              {isPlant !== null && isPlant < 0.5 && (
                <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  This might not be a plant. Try a closer photo of the leaves or flowers.
                </p>
              )}
              {suggestions.length === 0 && <p className="text-center text-muted-foreground">No matches found for this photo.</p>}
              {suggestions.map((s) => (
                <Card key={s.id} className="overflow-hidden md:flex">
                  {s.image ? (
                    <img src={s.image} alt={s.name} loading="lazy" className="h-48 w-full object-cover md:h-auto md:w-56" />
                  ) : (
                    <div className="flex h-48 w-full md:w-56 shrink-0 items-center justify-center bg-muted/60 text-muted-foreground">
                      <Leaf className="h-10 w-10 text-emerald-500/40" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-xl italic">{s.name}</CardTitle>
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{Math.round(s.probability * 100)}% match</Badge>
                      </div>
                      {s.commonNames.length > 0 && (
                        <CardDescription>{s.commonNames.slice(0, 4).join(", ")}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {s.description && <p className="line-clamp-3 text-sm text-muted-foreground">{s.description}</p>}
                      <div className="flex flex-wrap gap-2">
                        {user ? (
                          <Button size="sm" variant="outline" disabled={saving === s.id || saved.has(s.id)} onClick={() => saveToGarden(s)}>
                            {saved.has(s.id) ? <Check className="mr-2 h-4 w-4" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
                            {saved.has(s.id) ? "Saved" : "Save to my garden"}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" asChild><Link to="/profile">Sign in to save</Link></Button>
                        )}
                        {s.wikiUrl && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={s.wikiUrl} target="_blank" rel="noreferrer">Read more <ExternalLink className="ml-2 h-3 w-3" /></a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="name" className="mt-8 space-y-8">
          <form onSubmit={onNameSearch} className="mx-auto flex max-w-xl gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “monstera” or “lavandula”" aria-label="Plant name" />
            <Button type="submit" disabled={searching || query.trim().length < 2} className="bg-emerald-600 hover:bg-emerald-700">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Search</span>
            </Button>
          </form>

          {results && results.length === 0 && <p className="text-center text-muted-foreground">No plants matched “{initialQ || query}”. Try the Latin name.</p>}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results?.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.commonName ?? p.scientificName}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      e.currentTarget.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                ) : null}
                <div className={`flex h-44 flex-col items-center justify-center bg-muted/50 p-4 text-center text-sm text-muted-foreground ${p.imageUrl ? "hidden" : ""}`}>
                  <Leaf className="h-8 w-8 text-emerald-500/40 mb-1" />
                  <span>No botanical photo</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{p.commonName ?? p.scientificName}</CardTitle>
                  <CardDescription className="italic">{p.commonName ? p.scientificName : ""}</CardDescription>
                </CardHeader>
                {p.family && <CardContent><Badge variant="secondary">{p.family}</Badge></CardContent>}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
