import { Suspense } from 'react';
import HeroSlider from '@/components/HeroSlider';
import FeaturedOffers from '@/components/FeaturedOffers';
import FeaturedCars from '@/components/FeaturedCars';
import FeaturedCarsSkeleton from '@/components/FeaturedCarsSkeleton';
import AboutAndStats from '@/components/AboutAndStats';
import Reviews from '@/components/Reviews';

export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <FeaturedOffers />
      <Suspense fallback={<FeaturedCarsSkeleton />}>
        <FeaturedCars />
      </Suspense>
      <Reviews />
      <AboutAndStats />
    </div>
  );
}
