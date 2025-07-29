import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Clock, Droplet, Zap, Gauge } from 'lucide-react';
import Link from 'next/link';

interface OfferPageProps {
  params: {
    slug: string;
  };
}

// Helper function to find a specific attribute
// const getAttribute = (car: any, name: string) => {
//   const attr = car.attributes.find((a: any) => a.name === name);
//   return attr ? attr.value : 'N/A';
// };

// Helper component for fuel icons
const FuelIcon = ({ type }: { type: string | null }) => {
  const lowerType = type?.toLowerCase();
  if (lowerType?.includes('eléctrico')) {
    return <Zap className="h-4 w-4 text-blue-500" />;
  }
  if (lowerType?.includes('gasolina') || lowerType?.includes('diésel')) {
    return <Droplet className="h-4 w-4 text-green-500" />;
  }
  return null;
};

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
          {offer.cars.map((car) => {
            const monthlyPayment = car.financedPrice ? (car.financedPrice / 72).toFixed(0) : (car.regularPrice / 72).toFixed(0);

            return (
              <Link key={car.id} href={`/car/${car.id}`} className="bg-transparent group">
                <div className="relative">
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={car.images[0]?.url || '/placeholder.svg'}
                          alt={car.name}
                          width={300}
                          height={200}
                          className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>
                <div className="p-2 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mt-2 truncate group-hover:text-blue-600">{car.name}</h3>
                  
                  <div className="text-xs text-gray-500 my-3 flex flex-wrap gap-x-3 gap-y-1">
                    {car.year && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {car.year}</span>}
                    {car.kms && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {new Intl.NumberFormat('es-ES').format(car.kms)} km</span>}
                    {car.transmission && <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {car.transmission}</span>}
                  </div>
                  
                  <div className="mt-auto pt-2 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <FuelIcon type={car.fuel} />
                            <span className="text-sm font-medium">{car.fuel}</span>
                        </div>
                        {car.financedPrice && (
                            <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                                Desde {monthlyPayment}€/mes
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.regularPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
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