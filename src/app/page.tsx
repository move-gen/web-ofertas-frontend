import { Suspense } from 'react';
import FeaturedCars from '@/components/FeaturedCars';
import FeaturedCarsSkeleton from '@/components/FeaturedCarsSkeleton';
import LandingClientPart from '@/components/LandingClientPart';

export default function HomePage() {
  return (
    <div>
      <LandingClientPart />
      <Suspense fallback={<FeaturedCarsSkeleton />}>
        <FeaturedCars />
      </Suspense>
    </div>
  );
}
