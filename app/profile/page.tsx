import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Camera, CheckCircle2, Loader2, LogOut, Mail, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"
import { api, errorMessage, fieldError } from "@/lib/api"
import type { ContactMessage, GardenPlant, User } from "@/lib/types"

function FieldError({ error, field }: { error: unknown; field: string }) {
  const msg = fieldError(error, field)
  return msg ? <p className="text-sm text-destructive">{msg}</p> : null
}

function AuthForms() {
  const { login, register, resendVerification } = useAuth()
  const { toast } = useToast()
  const [mode, setMode] = useState("login")
  const [busy, setBusy] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    setUnverifiedEmail(null)
    const email = String(f.get("email")).trim()

    try {
      if (mode === "login") {
        await login(email, String(f.get("password")))
      } else {
        const res = await register(String(f.get("name")), email, String(f.get("password")))
        if (res.requiresVerification) {
          setRegisteredEmail(res.email || email)
          if (res.devVerificationUrl) setDevVerificationUrl(res.devVerificationUrl)
          toast({
            title: "Check your email",
            description: "A verification link has been sent to " + (res.email || email),
          })
        }
      }
    } catch (err) {
      setError(err)
      const msg = errorMessage(err)
      if (msg.toLowerCase().includes("verify your email") || msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already in use")) {
        setUnverifiedEmail(email)
      }
      toast({
        title: mode === "login" ? "Couldn't sign in" : "Couldn't create account",
        description: msg.toLowerCase().includes("already registered")
          ? "This email is already registered. Please sign in, or click the verification link sent to your inbox."
          : msg,
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleResend(targetEmail: string) {
    if (!targetEmail) return
    setResending(true)
    try {
      const res = await resendVerification(targetEmail)
      if (res.devVerificationUrl) setDevVerificationUrl(res.devVerificationUrl)
      toast({ title: "Verification email sent", description: res.message })
    } catch (err) {
      toast({ title: "Couldn't send email", description: errorMessage(err), variant: "destructive" })
    } finally {
      setResending(false)
    }
  }

  if (registeredEmail) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong className="text-foreground">{registeredEmail}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>Click the link inside the email to complete your registration and activate your account.</p>

          {devVerificationUrl && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-left">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                💡 Local Development Helper
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                SMTP credentials are not configured in <code>.env</code>. You can verify immediately using this link:
              </p>
              <a
                href={devVerificationUrl}
                className="mt-2 inline-block font-semibold text-emerald-600 underline hover:text-emerald-700"
              >
                Click here to verify now &rarr;
              </a>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={resending}
              onClick={() => handleResend(registeredEmail)}
              className="w-full"
            >
              {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend verification email
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRegisteredEmail(null)
                setDevVerificationUrl(null)
                setMode("login")
              }}
              className="w-full"
            >
              Back to Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Your PlantID account</CardTitle>
        <CardDescription>Save identified plants and keep your garden in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v)
            setError(null)
            setUnverifiedEmail(null)
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign in</TabsTrigger>
            <TabsTrigger value="register">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value={mode}>
            {unverifiedEmail && (
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Email not verified</p>
                <p className="mt-1 text-xs text-muted-foreground">Please check your inbox or resend the link below.</p>
                {devVerificationUrl && (
                  <div className="mt-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      💡 Dev verification link:
                    </p>
                    <a
                      href={devVerificationUrl}
                      className="mt-1 inline-block font-semibold text-emerald-600 underline hover:text-emerald-700"
                    >
                      Click here to verify now &rarr;
                    </a>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={resending}
                  onClick={() => handleResend(unverifiedEmail)}
                  className="mt-2 w-full text-xs"
                >
                  {resending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Resend verification to {unverifiedEmail}
                </Button>
              </div>
            )}
            <form onSubmit={submit} className="mt-4 space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" autoComplete="name" required />
                  <FieldError error={error} field="name" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
                <FieldError error={error} field="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={mode === "register" ? 8 : undefined}
                  required
                />
                <FieldError error={error} field="password" />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function Dashboard({ user }: { user: User }) {
  const { setUser, logout } = useAuth()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [plants, setPlants] = useState<GardenPlant[] | null>(null)
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)

  useEffect(() => {
    api.get<{ plants: GardenPlant[] }>("/garden").then((r) => setPlants(r.plants)).catch(() => setPlants([]))
    if (user.role === "admin") api.get<{ messages: ContactMessage[] }>("/contact").then((r) => setMessages(r.messages)).catch(() => setMessages([]))
  }, [user.role])

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setSaving(true)
    setError(null)
    try {
      const r = await api.patch<{ user: User }>("/users/me", { name: f.get("name"), bio: f.get("bio") })
      setUser(r.user)
      toast({ title: "Profile saved" })
    } catch (err) {
      setError(err)
      toast({ title: "Couldn't save profile", description: errorMessage(err), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function uploadAvatar(file?: File) {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("avatar", file)
      const r = await api.upload<{ user: User }>("/users/me/avatar", form, "PUT")
      setUser(r.user)
      toast({ title: "Photo updated" })
    } catch (err) {
      toast({ title: "Couldn't upload photo", description: errorMessage(err), variant: "destructive" })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function removePlant(id: string) {
    try {
      await api.delete(`/garden/${id}`)
      setPlants((p) => p?.filter((x) => x._id !== id) ?? null)
    } catch (err) {
      toast({ title: "Couldn't remove plant", description: errorMessage(err), variant: "destructive" })
    }
  }

  async function removeMessage(id: string) {
    try {
      await api.delete(`/contact/${id}`)
      setMessages((m) => m?.filter((x) => x._id !== id) ?? null)
    } catch (err) {
      toast({ title: "Couldn't delete message", description: errorMessage(err), variant: "destructive" })
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full" aria-label="Change photo" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </Button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.isVerified ? (
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                  <CheckCircle2 className="mr-1 h-3 w-3 inline" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-500">
                  Unverified
                </Badge>
              )}
              {user.role === "admin" && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Admin</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={() => logout()}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Edit profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" name="name" defaultValue={user.name} required />
              <FieldError error={error} field="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-bio">About you</Label>
              <Textarea id="p-bio" name="bio" defaultValue={user.bio} maxLength={300} rows={3} />
              <FieldError error={error} field="bio" />
            </div>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My garden</CardTitle>
          <CardDescription>Plants you saved after identifying them.</CardDescription>
        </CardHeader>
        <CardContent>
          {plants === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}</div>
          ) : plants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing here yet. <Link to="/search" className="font-medium text-emerald-600 underline">Identify a plant</Link> and save it to start your garden.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plants.map((p) => (
                <Card key={p._id} className="overflow-hidden">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.commonName || p.scientificName} loading="lazy" className="h-36 w-full object-cover" /> : <div className="h-36 bg-muted" />}
                  <div className="flex items-start justify-between gap-2 p-4">
                    <div>
                      <p className="font-medium">{p.commonName || p.scientificName}</p>
                      {p.commonName && <p className="text-sm italic text-muted-foreground">{p.scientificName}</p>}
                    </div>
                    <Button size="icon" variant="ghost" aria-label={`Remove ${p.commonName || p.scientificName}`} onClick={() => removePlant(p._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {user.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Contact messages</CardTitle>
            <CardDescription>Visible to admins only. Publish blog posts from the <Link to="/blog" className="underline">Blog</Link> page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages === null ? <Skeleton className="h-20" /> : messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : messages.map((m) => (
              <div key={m._id} className="flex items-start justify-between gap-4 rounded-md border p-4">
                <div className="space-y-1">
                  <p className="font-medium">{m.subject}</p>
                  <p className="text-sm text-muted-foreground">{m.name} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.createdAt).toLocaleDateString()}</p>
                  <p className="whitespace-pre-line text-sm">{m.message}</p>
                </div>
                <Button size="icon" variant="ghost" aria-label="Delete message" onClick={() => removeMessage(m._id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function ProfilePage() {
  usePageTitle("Your profile")
  const { user, loading } = useAuth()
  return (
    <section className="container mx-auto max-w-4xl px-4 py-12">
      {loading ? <Skeleton className="mx-auto h-72 max-w-md" /> : user ? <Dashboard user={user} /> : <AuthForms />}
    </section>
  )
}
