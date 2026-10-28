import { Link } from "react-router-dom"
import { usePageTitle } from "@/hooks/use-page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
  Camera,
  Search,
  BookOpen,
  Users,
  Star,
  Sparkles,
  CheckCircle2,
  Droplets,
  Sun,
  Thermometer,
} from "lucide-react"

export default function HomePage() {
  usePageTitle()

  const featuredPlants = [
    {
      name: "Monstera Deliciosa",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80",
      description: "Popular indoor houseplant with iconic glossy perforated leaves",
      category: "Indoor",
    },
    {
      name: "English Lavender",
      image: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80",
      description: "Fragrant purple flowering herb celebrated for aromatherapy and calming properties",
      category: "Herb",
    },
    {
      name: "Japanese Maple",
      image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
      description: "Graceful ornamental deciduous tree renowned for rich crimson autumn foliage",
      category: "Tree",
    },
  ]

  const features = [
    {
      icon: <Camera className="h-8 w-8" />,
      title: "AI Plant Recognition",
      description: "Upload or take a photo to instantly identify any plant species",
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Comprehensive Database",
      description: "Access detailed information about thousands of plant species",
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Care Guides",
      description: "Get personalized care instructions for your plants",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community",
      description: "Connect with fellow plant enthusiasts and experts",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                  <Leaf className="h-4 w-4 mr-2" />
                  Plant Identification Made Easy
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Discover the
                  <span className="text-emerald-600"> Green World</span>
                  Around You
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Identify any plant instantly with our AI-powered recognition technology. Get detailed information,
                  care guides, and connect with a community of plant lovers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link to="/search">
                    <Camera className="h-5 w-5 mr-2" />
                    Start Identifying
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                >
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              {/* Background ambient lighting */}
              <div className="absolute -top-6 -right-6 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-6 -left-6 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl pointer-events-none"></div>

              {/* Main Scanner Mockup Card */}
              <div className="relative z-10 overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90 sm:p-6 transition-all hover:shadow-emerald-500/10">
                {/* Header bar */}
                <div className="flex items-center justify-between border-b pb-3 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold text-foreground">PlantID Live Recognition</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Sparkles className="mr-1 h-3 w-3 inline text-emerald-500" /> AI Online
                  </Badge>
                </div>

                {/* Camera Viewfinder Frame */}
                <div className="group relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-950 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1000&q=80"
                    alt="Monstera Deliciosa Plant Scanner"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Camera Reticle Brackets */}
                  <div className="pointer-events-none absolute inset-4">
                    <div className="absolute left-0 top-0 h-6 w-6 rounded-tl-md border-l-2 border-t-2 border-emerald-400"></div>
                    <div className="absolute right-0 top-0 h-6 w-6 rounded-tr-md border-r-2 border-t-2 border-emerald-400"></div>
                    <div className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-md border-b-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute bottom-0 right-0 h-6 w-6 rounded-br-md border-b-2 border-r-2 border-emerald-400"></div>

                    {/* Scanning Target Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full border border-dashed border-emerald-300/60 animate-spin" style={{ animationDuration: "12s" }}></div>
                    </div>
                  </div>

                  {/* Recognition Result Banner Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-black/70 px-3.5 py-2.5 text-white backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-xs text-white shadow">
                        98%
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">Monstera Deliciosa</p>
                        <p className="text-[10px] text-zinc-300">Swiss Cheese Plant • Araceae</p>
                      </div>
                    </div>
                    <span className="flex items-center text-[10px] font-semibold text-emerald-300">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> High Match
                    </span>
                  </div>
                </div>

                {/* Plant Care Quick Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-xl border bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <Droplets className="mx-auto h-4 w-4 text-sky-500 mb-1" />
                    <span className="text-[10px] text-muted-foreground block">Watering</span>
                    <span className="text-xs font-semibold">Every 1-2 wks</span>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <Sun className="mx-auto h-4 w-4 text-amber-500 mb-1" />
                    <span className="text-[10px] text-muted-foreground block">Light</span>
                    <span className="text-xs font-semibold">Bright Indirect</span>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <Thermometer className="mx-auto h-4 w-4 text-emerald-500 mb-1" />
                    <span className="text-[10px] text-muted-foreground block">Temperature</span>
                    <span className="text-xs font-semibold">18°C - 30°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Plant Enthusiasts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced technology combines AI recognition with comprehensive plant databases to provide you with
              accurate identification and detailed care information.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Plants Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Plant of the Week</h2>
            <p className="text-xl text-gray-600">
              Discover fascinating plants and learn about their unique characteristics
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPlants.map((plant, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative overflow-hidden">
                  <img
                    src={plant.image}
                    loading="lazy"
                    alt={plant.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-emerald-700">{plant.category}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{plant.name}</CardTitle>
                  <CardDescription>{plant.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                  >
                    <Link to={`/search?q=${encodeURIComponent(plant.name)}`}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gardening Tips Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative overflow-hidden rounded-2xl shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
                alt="Gardening tips and plant care"
                width={500}
                height={400}
                className="h-full w-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-semibold">Botanical Care Guides</p>
                <p className="text-xs text-zinc-200">Expert care instructions tailored to every indoor and outdoor variety</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Badge className="bg-amber-100 text-amber-800 mb-4">
                  <Star className="h-4 w-4 mr-2" />
                  Expert Tips
                </Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Master the Art of Plant Care</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Get expert advice on plant care, seasonal gardening tips, and troubleshooting common plant problems.
                  Our comprehensive guides help you become a better plant parent.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Watering Guidelines</h3>
                    <p className="text-gray-600">Learn the perfect watering schedule for different plant types</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Light Requirements</h3>
                    <p className="text-gray-600">Understand how to provide optimal lighting conditions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pest Management</h3>
                    <p className="text-gray-600">Identify and treat common plant pests naturally</p>
                  </div>
                </div>
              </div>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link to="/blog">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Read More Tips
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Explore the Plant Kingdom?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of plant enthusiasts who use our platform to identify, learn about, and care for their green
            companions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              <Link to="/search">
                <Camera className="h-5 w-5 mr-2" />
                Start Identifying Plants
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link to="/profile">Create Your Profile</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
