"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Offer {
  id: number;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
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
}

export default function FeaturedOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/offers/feed');
        if (!response.ok) throw new Error('Failed to fetch offers');
        
        const allOffers = await response.json();
        // Mostrar solo las 3 últimas ofertas
        setOffers(allOffers.slice(0, 3));
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="mx-auto px-6 max-w-[1390px]">
          {/* Cabecera con imagen lateral (estilo Home2) */}
          <div className="mb-16 grid grid-cols-1 md:grid-cols-[auto,1fr] items-center gap-8">
            <div className="flex justify-center md:justify-start">
              <Image
                src="/da4b1e18005fecdf893baf1e80d2e20b0c15e062.png"
                alt="Decoración ofertas"
                width={374}
                height={374}
                className="w-56 h-56 md:w-80 md:h-80 object-contain"
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-6">Últimas Ofertas</h2>
              <p className="text-lg text-neutral-600 max-w-2xl">
                Encuentra promociones activas por tiempo limitado en todas nuestras islas. Elige la campaña que más se adapte a tus necesidades.
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (offers.length === 0) {
    return (
      <section className="py-20 bg-white">
      <div className="mx-auto px-6 max-w-[1390px]">
        {/* Cabecera con imagen lateral (estilo Home2) */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-[auto,1fr] items-center gap-8">
          <div className="flex justify-center md:justify-start">
            <Image
              src="/da4b1e18005fecdf893baf1e80d2e20b0c15e062.png"
              alt="Decoración ofertas"
              width={374}
              height={374}
              className="w-56 h-56 md:w-80 md:h-80 object-contain"
              priority
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-6">Últimas Ofertas</h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Encuentra promociones activas por tiempo limitado en todas nuestras islas. Elige la campaña que más se adapte a tus necesidades.
            </p>
          </div>
        </div>
          <div className="text-center text-gray-500">
            No hay ofertas disponibles en este momento.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto px-6 max-w-[1390px]">
        {/* Cabecera con imagen lateral (estilo Home2) */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-[auto,1fr] items-center gap-8">
          <div className="flex justify-center md:justify-start">
            <Image
              src="/da4b1e18005fecdf893baf1e80d2e20b0c15e062.png"
              alt="Decoración ofertas"
              width={374}
              height={374}
              className="w-56 h-56 md:w-80 md:h-80 object-contain"
              priority
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-6">Últimas Ofertas</h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Encuentra promociones activas por tiempo limitado en todas nuestras islas. Elige la campaña que más se adapte a tus necesidades.
            </p>
          </div>
        </div>

        {/* Grid de ofertas - Solo imágenes limpias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Link 
              key={offer.id} 
              href={`/ofertas/${offer.slug}`}
              className="group block overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300"
            >
              {/* Solo imagen de portada - responsive para móvil */}
              <div className="relative h-[27rem] sm:h-[32.4rem] bg-gray-100">
                {offer.coverImageUrl ? (
                  <Image
                    src={offer.coverImageUrl}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-sm">Sin imagen de portada</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Botón para ver todas las ofertas */}
        <div className="text-center mt-16">
          <Link 
            href="/ofertas"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-base"
          >
            Ver más
          </Link>
        </div>
      </div>
    </section>
  );
}