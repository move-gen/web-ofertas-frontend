import CarCard from '@/components/CarCard';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';


interface OfferPageProps {
  params: {
    slug: string;
  };
}



export default async function OfferPage({ params }: OfferPageProps) {
  const offer = await prisma.offer.findUnique({
    where: { slug: params.slug },
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

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{offer.title}</h1>
        <p className="text-md text-gray-600 mb-8">Descubre los vehículos incluidos en esta oferta especial.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offer.cars.map((car) => (
            <CarCard key={car.id} car={car as any} />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: OfferPageProps) {
  const offer = await prisma.offer.findUnique({ where: { slug: params.slug } });
  if (!offer) return { title: 'Oferta no encontrada' };
  return {
    title: `Oferta: ${offer.title}`,
    description: `Detalles de la oferta especial "${offer.title}".`,
  };
} 