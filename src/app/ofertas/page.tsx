import { prisma } from '@/lib/prisma';
import OfferSection from '@/components/OfferSection';

async function getOffersFeed() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offers/feed`, {
    cache: 'no-store', // Fetch fresh data on each request
  });
  if (!response.ok) {
    throw new Error('Failed to fetch offers feed');
  }
  return response.json();
}

export default async function OffersFeedPage() {
  const offers = await getOffersFeed();

  return (
    <div className="pt-24 bg-gray-50">
      {offers.map((offer: any) => (
        <OfferSection key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
