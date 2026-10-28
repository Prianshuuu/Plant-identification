import { Suspense } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import Loading from "./loading"

// Replaces the Next.js root layout: page metadata lives in index.html,
// ThemeProvider/AuthProvider are mounted in App.tsx.
export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Toaster />
      <ScrollRestoration />
    </div>
  )
}
