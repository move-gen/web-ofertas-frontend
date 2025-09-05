import OffersGrid from '@/components/OffersGrid';
import { Car, Offer, Image as CarImage } from '@prisma/client';

export const dynamic = 'force-dynamic';

type CarWithImages = Car & { images: CarImage[] };
type OfferWithCars = Offer & { cars: CarWithImages[] };

async function getOffersFeed(): Promise<OfferWithCars[]> {
  const response = await fetch('/api/offers/feed', {
    cache: 'no-store', // Fetch fresh data on each request
  });
  if (!response.ok) {
    throw new Error('Failed to fetch offers feed');
  }
  return response.json();
}

export default async function OffersFeedPage() {
  try {
    console.log('🔄 Loading offers...');
    const allOffers: OfferWithCars[] = await getOffersFeed();
    console.log('📋 All offers loaded:', allOffers.length);
    
    // Mostrar solo las 3 últimas ofertas
    const offers = allOffers.slice(0, 3);
    console.log('🎯 Showing offers:', offers.length);

    if (offers.length === 0) {
      return (
        <div className="pt-24 bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-900 mb-4">
                Vehículos Seleccionados con Condiciones Especiales
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Encuentra promociones activas por tiempo limitado en todas nuestras islas. 
                Elige la campaña que más se adapta a ti.
              </p>
              <div className="text-sm text-gray-500">
                No hay ofertas disponibles en este momento. (Total en BD: {allOffers.length})
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="pt-24 bg-gray-50">
        <OffersGrid offers={offers} />
      </div>
    );
  } catch (error) {
    console.error('❌ Error loading offers:', error);
    return (
      <div className="pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Vehículos Seleccionados con Condiciones Especiales
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Encuentra promociones activas por tiempo limitado en todas nuestras islas. 
              Elige la campaña que más se adapta a ti.
            </p>
            <div className="text-sm text-red-500">
              Error: {error instanceof Error ? error.message : 'Error desconocido'}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
