import OffersGrid from '@/components/OffersGrid';
import { Car, Offer, Image as CarImage } from '@prisma/client';

type CarWithImages = Car & { images: CarImage[] };
type OfferWithCars = Offer & { cars: CarWithImages[] };

async function getOffersFeed(): Promise<OfferWithCars[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offers/feed`, {
    cache: 'no-store', // Fetch fresh data on each request
  });
  if (!response.ok) {
    throw new Error('Failed to fetch offers feed');
  }
  return response.json();
}

export default async function OffersFeedPage() {
  const allOffers: OfferWithCars[] = await getOffersFeed();
  
  // Mostrar solo las 3 últimas ofertas
  const offers = allOffers.slice(0, 3);

  return (
    <div className="pt-24 bg-gray-50">
      <OffersGrid offers={offers} />
    </div>
  );
}
