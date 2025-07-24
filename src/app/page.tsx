import { Search, Bell, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Header from "@/components/Header" // Importar el nuevo componente

export default function Component() {
  return (
    <div className="min-h-screen bg-white">
      <Header /> {/* Usar el nuevo componente Header */}

      {/* Hero Section with exact curved shape */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div
            className="w-full h-full bg-gradient-to-b from-[#2364c4] via-blue-400 to-cyan-400"
            style={{
              clipPath: "ellipse(120% 100% at 50% 0%)",
              height: "400px",
            }}
          />
        </div>
        <div className="relative z-10 text-white pt-12 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-12">{"Encuentra tu coche "}</h1>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-lg">
                <Search className="w-5 h-5 text-gray-400 mr-4" />
                <Input
                  placeholder="Encontramos el coche que estás buscando"
                  className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 text-base"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-500 px-6 py-2 rounded-full font-medium"
              >
                Shop Used
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-500 px-6 py-2 rounded-full font-medium"
              >
                Shop New
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-500 px-6 py-2 rounded-full font-medium"
              >
                Appraise My Car
              </Button>
            </div>

            {/* Recently Viewed */}
            <div className="text-sm">
              <span className="text-blue-100 mr-4">Ver más coches</span>
              <a href="#" className="underline hover:no-underline">
                Miguel León 2025
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Research By Type */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">Research By Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { type: "EV", hasPlug: true },
              { type: "SUV", hasPlug: false },
              { type: "Truck", hasPlug: false },
              { type: "Sedan", hasPlug: false },
              { type: "Hybrid", hasPlug: false },
            ].map((vehicle) => (
              <div key={vehicle.type} className="text-center cursor-pointer group">
                <div className="bg-blue-50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <div className="relative">
                    {/* Car silhouette */}
                    <svg className="w-16 h-10 text-blue-500" viewBox="0 0 64 40" fill="currentColor">
                      <path d="M8 32h4c0 2.2 1.8 4 4 4s4-1.8 4-4h24c0 2.2 1.8 4 4 4s4-1.8 4-4h4c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4h-8l-4-8H16l-4 8H4c-2.2 0-4 1.8-4 4v12c0 2.2 1.8 4 4 4z" />
                      <circle cx="16" cy="32" r="2" fill="white" />
                      <circle cx="48" cy="32" r="2" fill="white" />
                    </svg>
                    {/* EV plug icon */}
                    {vehicle.hasPlug && (
                      <div className="absolute -top-2 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{vehicle.type}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Cards */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-64">
              <Image src="/placeholder.svg" alt="2025 Mazda CX-5" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">Ad</div>
              <CardContent className="absolute bottom-0 left-0 p-6 text-white">
                <p className="text-xs mb-1 opacity-80">Photo Sponsored By</p>
                <h3 className="text-xl font-bold mb-2">2025 Mazda CX-5</h3>
                <p className="text-sm underline cursor-pointer hover:no-underline">View Offers at MazdaUSA.com ↗</p>
              </CardContent>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-64">
              <Image src="/placeholder.svg" alt="2025 Ford Bronco" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <CardContent className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">2025 Ford Bronco</h3>
                <p className="text-sm underline cursor-pointer hover:no-underline">Learn More ↗</p>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Sponsored Content Label */}
      <div className="text-center py-8 bg-gray-50">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Sponsored Content</p>
      </div>
    </div>
  )
}
