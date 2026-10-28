import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { api, ApiError } from "@/lib/api"
import type { User } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ requiresVerification?: boolean; message?: string; email?: string; devVerificationUrl?: string }>
  resendVerification: (email: string) => Promise<{ message: string; devVerificationUrl?: string }>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore the session from the httpOnly cookie on first load
  useEffect(() => {
    api
      .get<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) console.error(e)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.post<{ user: User }>("/auth/login", { email, password })
    setUser(r.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const r = await api.post<{ user?: User; requiresVerification?: boolean; message?: string; email?: string; devVerificationUrl?: string }>("/auth/register", {
      name,
      email,
      password,
    })
    if (r.user) setUser(r.user)
    return { requiresVerification: r.requiresVerification, message: r.message, email: r.email, devVerificationUrl: r.devVerificationUrl }
  }, [])

  const resendVerification = useCallback(async (email: string) => {
    const r = await api.post<{ message: string; devVerificationUrl?: string }>("/auth/resend-verification", { email })
    return { message: r.message, devVerificationUrl: r.devVerificationUrl }
  }, [])

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {})
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, resendVerification, logout, setUser }),
    [user, loading, login, register, resendVerification, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
