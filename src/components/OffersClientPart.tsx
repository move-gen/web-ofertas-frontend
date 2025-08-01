"use client";
import { useState, useEffect } from 'react';
import CarCard from './CarCard';
import { Heart, Filter, ArrowUpDown, MapPin, Phone, Clock } from 'lucide-react';


interface Car {
  id: number;
  name: string; // Add name
  make: string;
  model: string;
  version: string;
  year: number | null; // Allow null
  kms: number | null; // Allow null
  power: number;
  fuel: string | null; // Allow null
  transmission: string | null; // Allow null
  regularPrice: number;
  financedPrice: number | null; // Allow null
  monthlyFinancingFee: number;
  environmentalBadge: string;
  images: { url: string; isPrimary: boolean }[];
}

export default function OffersClientPart() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    makers: [],
    priceRange: [0, 40000],
    fuel: [],
    bodyType: [],
    mileageRange: [0, 10000],
    yearRange: [2013, 2025]
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <OffersSkeleton />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner superior - exactamente como Clicars */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2">
            <div className="text-sm font-medium">Financiación fácil y flexible en el acto</div>
            <div className="text-sm">15 días o 1000 km. de prueba</div>
            <div className="text-sm">
              ¡Elige entre {cars.length} coches! Al mejor precio. <strong>Entrega en 24h a domicilio ¡VISÍTANOS!</strong>
            </div>
            <div className="text-sm">
              ¡Ven a visitarnos! Haz click <Link href="/contacto" className="underline">aquí</Link> o busca MiguelLeón en Google maps
            </div>
          </div>
        </div>
      </div>

      {/* Centros de contacto - responsive como Clicars */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-lg font-semibold mb-4">Encuentra tu centro MiguelLeón:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Centro 1 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Las Palmas</span>
              </div>
              <div className="space-y-2">
                <a href="tel:+34 928 123 456" className="block text-blue-600 font-semibold">928 123 456</a>
                <p className="text-sm text-gray-600">
                  C/ Example, 123<br />
                  35001 Las Palmas<br />
                  <Link href="#" className="text-blue-600 underline">Cómo llegar</Link>
                </p>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Lunes a Viernes: 09:30 a 20:30h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Sábados: 10:00 a 19:00h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Centro 2 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Santa Cruz</span>
              </div>
              <div className="space-y-2">
                <a href="tel:+34 922 123 456" className="block text-blue-600 font-semibold">922 123 456</a>
                <p className="text-sm text-gray-600">
                  Av/ Example, 456<br />
                  38001 Santa Cruz<br />
                  <Link href="#" className="text-blue-600 underline">Cómo llegar</Link>
                </p>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Lunes a Viernes: 09:30 a 20:30h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Sábados: 10:00 a 19:00h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Centro 3 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Fuerteventura</span>
              </div>
              <div className="space-y-2">
                <a href="tel:+34 928 123 789" className="block text-blue-600 font-semibold">928 123 789</a>
                <p className="text-sm text-gray-600">
                  C/ Example, 789<br />
                  35600 Puerto del Rosario<br />
                  <Link href="#" className="text-blue-600 underline">Cómo llegar</Link>
                </p>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Lunes a Viernes: 09:30 a 20:30h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Sábados: 10:00 a 19:00h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros laterales - exactamente como Clicars */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>

              {/* Marca */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Marca</h3>
                <div className="space-y-2">
                  {['Peugeot', 'Renault', 'Toyota', 'Volkswagen', 'BMW', 'Mercedes'].map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Precio */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Precio</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="40000"
                    className="w-full"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({...filters, priceRange: [0, parseInt(e.target.value)]})}
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0€</span>
                    <span>{filters.priceRange[1].toLocaleString()}€</span>
                  </div>
                </div>
              </div>

              {/* Combustible */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Combustible</h3>
                <div className="space-y-2">
                  {['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico'].map((fuel) => (
                    <label key={fuel} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{fuel}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Carrocería */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Carrocería</h3>
                <div className="space-y-2">
                  {['SUV y 4X4', 'Berlina', 'Familiar', 'Compacto'].map((body) => (
                    <label key={body} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{body}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Kilómetros */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Kilómetros</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    className="w-full"
                    value={filters.mileageRange[1]}
                    onChange={(e) => setFilters({...filters, mileageRange: [0, parseInt(e.target.value)]})}
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0 km</span>
                    <span>{filters.mileageRange[1].toLocaleString()} km</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Ver {cars.length} coches
              </button>
            </div>
          </div>

          {/* Grid de coches - exactamente como Clicars */}
          <div className="lg:w-3/4">
            {/* Barra de ordenación */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  <span className="font-semibold">Filtros</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5" />
                    <span className="text-sm">Ordenar por</span>
                    <select className="border rounded px-2 py-1 text-sm">
                      <option>Precio: menor/mayor</option>
                      <option>Precio: mayor/menor</option>
                      <option>Cuota: menor/mayor</option>
                      <option>Km: menos/más</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Título */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {cars.length} Coches de km 0 al mejor precio
              </h1>
            </div>

            {/* Grid de coches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Paginación */}
            <div className="mt-8 text-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Ver más coches
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 