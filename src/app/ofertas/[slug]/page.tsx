import CarCard from '@/components/CarCard';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { Car, Image as CarImage } from '@prisma/client';

interface OfferPageProps {
  params: Promise<{
    slug: string;
  }>;
}

type CarWithImages = Car & { images: CarImage[] };

export default async function OfferPage({ params }: OfferPageProps) {
  const { slug } = await params;
  const offer = await prisma.offer.findUnique({
    where: { slug: slug },
    include: {
      cars: {
        include: {
          images: {
            orderBy: {
              isPrimary: 'desc', // true (primary) will come first
            }
          },
        },
      },
    },
  });

  if (!offer) {
    notFound();
  }

  const carItems = offer.cars.map((car) => ({
    id: car.id, // Add id for unique key in HoverEffect
    link: `/car/${car.id}`,
    children: <CarCard car={car as CarWithImages} />,
  }));

  const words = offer.title.split(" ").map((word, index) => ({
    text: word,
    className: index > 2 ? "text-blue-500 dark:text-blue-500" : "",
  }));

  return (
    <div className="bg-gray-50">
       <div className="flex flex-col items-center justify-center h-[20rem] bg-white dark:bg-black">
        <p className="text-neutral-600 dark:text-neutral-200 text-base mb-5">
          {offer.description || 'Descubre los vehículos incluidos en esta oferta especial.'}
        </p>
        <TypewriterEffectSmooth words={words} />
      </div>
      <div className="container mx-auto px-4 py-12">
        <HoverEffect items={carItems} />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: OfferPageProps) {
  const { slug } = await params;
  const offer = await prisma.offer.findUnique({ where: { slug: slug } });
  if (!offer) return { title: 'Oferta no encontrada' };
  return {
    title: `Oferta: ${offer.title}`,
    description: `Detalles de la oferta especial "${offer.title}".`,
  };
}
