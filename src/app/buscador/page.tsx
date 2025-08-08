import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import OffersClientPart from '@/components/OffersClientPart';
import OffersSkeleton from '@/components/OffersSkeleton';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';

export default async function BuscadorPage() {

  const words = [
    {
      text: "Encuentra",
    },
    {
      text: "el",
    },
    {
      text: "coche",
    },
    {
      text: "de",
    },
    {
      text: "tus",
    },
    {
      text: "sueños",
    },
    {
      text: "en",
    },
    {
      text: "Miguel",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "León.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-[20rem] bg-white dark:bg-black">
        <p className="text-neutral-600 dark:text-neutral-200 text-base mb-5">
          Tu próximo coche te está esperando
        </p>
        <TypewriterEffectSmooth words={words} />
      </div>
      <OffersClientPart />
    </div>
  );
}

