import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"
import { api, errorMessage } from "@/lib/api"
import type { User } from "@/lib/types"

export default function VerifyEmailPage() {
  usePageTitle("Verify Email - PlantID")
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const { setUser, resendVerification } = useAuth()
  const { toast } = useToast()

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">(token ? "loading" : "idle")
  const [message, setMessage] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("idle")
      return
    }

    let isMounted = true
    setStatus("loading")

    api
      .post<{ message: string; user: User }>("/auth/verify-email", { token })
      .then((res) => {
        if (!isMounted) return
        setUser(res.user)
        setMessage(res.message || "Email verified successfully!")
        setStatus("success")
      })
      .catch((err) => {
        if (!isMounted) return
        setMessage(errorMessage(err))
        setStatus("error")
      })

    return () => {
      isMounted = false
    }
  }, [token, setUser])

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!resendEmail) return
    setResending(true)
    try {
      const res = await resendVerification(resendEmail)
      toast({ title: "Email sent", description: res.message })
    } catch (err) {
      toast({ title: "Couldn't send email", description: errorMessage(err), variant: "destructive" })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] max-w-lg items-center justify-center px-4 py-12">
      <Card className="w-full">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
            <CardTitle className="text-xl">Verifying your email...</CardTitle>
            <CardDescription className="mt-2">Please wait while we verify your account credentials.</CardDescription>
          </div>
        )}

        {status === "success" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">Email Verified!</CardTitle>
              <CardDescription className="text-base">{message}</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Your email has been confirmed. You now have full access to identify plants, save favorites to your garden, and publish posts.
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link to="/profile">
                  Go to Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/search">Identify Plants</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {status === "error" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-destructive">Verification Failed</CardTitle>
              <CardDescription className="text-base">{message || "The verification link is invalid or has expired."}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResend} className="space-y-4 rounded-lg border p-4 bg-muted/30">
                <p className="text-sm font-medium">Need a new verification link?</p>
                <div className="space-y-2">
                  <Label htmlFor="resend-email">Your email address</Label>
                  <Input
                    id="resend-email"
                    type="email"
                    placeholder="name@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={resending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Verification Email
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">Back to Sign In</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {status === "idle" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Mail className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Email Verification</CardTitle>
              <CardDescription>Enter your email address to receive a new verification link.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResend} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resend-idle-email">Email</Label>
                  <Input
                    id="resend-idle-email"
                    type="email"
                    placeholder="name@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={resending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Verification Link
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">Back to Sign In</Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
