import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import OffersClientPart from '@/components/OffersClientPart';
import OffersSkeleton from '@/components/OffersSkeleton';

export default async function OffersPage() {
  return (
    <div>
      <OffersClientPart />
    </div>
  );
} 