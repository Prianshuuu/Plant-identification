import { lazy } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import RootLayout from "./layout"

// One lazy chunk per page, mirroring the old app/ route folders
const Home = lazy(() => import("./page"))
const About = lazy(() => import("./about/page"))
const Blog = lazy(() => import("./blog/page"))
const Contact = lazy(() => import("./contact/page"))
const Profile = lazy(() => import("./profile/page"))
const VerifyEmail = lazy(() => import("./verify-email/page"))
const Search = lazy(() => import("./search/page"))
const Software = lazy(() => import("./software/page"))
const NotFound = lazy(() => import("./not-found"))

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "blog", element: <Blog /> },
      { path: "contact", element: <Contact /> },
      { path: "profile", element: <Profile /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "search", element: <Search /> },
      { path: "software", element: <Software /> },
      { path: "*", element: <NotFound /> },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
