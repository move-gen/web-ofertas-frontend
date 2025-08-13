import OfferSection from '@/components/OfferSection';
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
  const offers: OfferWithCars[] = await getOffersFeed();

  return (
    <div className="pt-24 bg-gray-50">
      {offers.map((offer: OfferWithCars) => (
        <OfferSection key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
