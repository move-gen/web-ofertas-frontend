"use client";
import { Offer } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type OfferWithCars = Offer & { 
  cars: Array<{
    id: number;
    name: string;
    regularPrice: number;
    monthlyFinancingFee?: number | null;
    images: Array<{
      url: string;
      isPrimary: boolean;
    }>;
  }>;
};

interface OffersGridProps {
  offers: OfferWithCars[];
}

export default function OffersGrid({ offers }: OffersGridProps) {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Título principal */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Vehículos Seleccionados con Condiciones Especiales
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Encuentra promociones activas por tiempo limitado en todas nuestras islas. 
            Elige la campaña que más se adapta a ti.
          </p>
        </div>

        {/* Grid de ofertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <Link 
              key={offer.id} 
              href={`/ofertas/${offer.slug}`}
              className="group block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Imagen de portada */}
              <div className="relative h-64 bg-gray-100">
                {offer.coverImageUrl ? (
                  <Image
                    src={offer.coverImageUrl}
                    alt={offer.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-sm">Sin imagen de portada</span>
                  </div>
                )}
                
                {/* Overlay con información básica */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{offer.title}</h3>
                  <p className="text-white/90 text-sm">
                    {offer.cars.length} coche{offer.cars.length !== 1 ? 's' : ''} disponible{offer.cars.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {offer.description || 'Descubre nuestras mejores ofertas en vehículos seleccionados.'}
                </p>
                
                {/* Precio desde */}
                {offer.cars.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">Desde</span>
                      <div className="text-xl font-bold text-blue-900">
                        {offer.cars[0].monthlyFinancingFee ? 
                          `${offer.cars[0].monthlyFinancingFee.toLocaleString()}€/mes` :
                          `${offer.cars[0].regularPrice.toLocaleString()}€`
                        }
                      </div>
                    </div>
                    <div className="text-blue-600 group-hover:text-blue-800 transition-colors">
                      Ver oferta →
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Botón para ver todas las ofertas */}
        <div className="text-center mt-12">
          <Link 
            href="/ofertas"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver todas las ofertas
          </Link>
        </div>
      </div>
    </div>
  );
}
