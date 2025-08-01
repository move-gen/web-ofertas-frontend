import { Suspense } from 'react';
import HeroSlider from '@/components/HeroSlider';
import FeaturedOffers from '@/components/FeaturedOffers';
import FeaturedCars from '@/components/FeaturedCars';
import FeaturedCarsSkeleton from '@/components/FeaturedCarsSkeleton';
import AboutAndStats from '@/components/AboutAndStats';

export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <FeaturedOffers />
      <Suspense fallback={<FeaturedCarsSkeleton />}>
        <FeaturedCars />
      </Suspense>
      <AboutAndStats />
    </div>
  );
}
