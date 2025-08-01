import Image from 'next/image';
import { Clock, Droplet, Zap, Gauge } from 'lucide-react';

// This is the single source of truth for the car card's data structure.
// All components using CarCard must provide a car object that fits this shape.
interface Car {
  id: number;
  name: string;
  year: number | null;
  kms: number | null;
  transmission: string | null;
  fuel: string | null;
  regularPrice: number;
  financedPrice: number | null;
  images: { url: string; isPrimary?: boolean }[]; // isPrimary is optional now
}

interface CarCardProps {
  car: Car;
}

const FuelIcon = ({ type }: { type: string | null }) => {
  const lowerType = type?.toLowerCase();
  if (lowerType?.includes('eléctrico')) return <Zap className="h-4 w-4 text-blue-500" />;
  if (lowerType?.includes('gasolina') || lowerType?.includes('diésel')) return <Droplet className="h-4 w-4 text-green-500" />;
  return null;
};

export default function CarCard({ car }: CarCardProps) {
    // Calculation for monthly payment, can be adjusted
    const monthlyPayment = car.financedPrice ? (car.financedPrice / 72).toFixed(0) : (car.regularPrice / 72).toFixed(0);
    // Prioritize primary image, but fall back to the first one available
    const primaryImage = car.images.find(img => img.isPrimary) || car.images[0];

    return (
        <div className="bg-transparent group flex flex-col transition hover:-translate-y-1 h-full">
            <div className="relative w-full aspect-[4/3] bg-gray-100">
                <Image
                  src={primaryImage?.url || '/placeholder.svg'}
                  alt={car.name}
                  fill
                  className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-gray-800 text-lg leading-tight mt-1 truncate group-hover:text-blue-600">{car.name}</h3>
              
              <div className="text-xs text-gray-500 my-3 flex flex-wrap gap-x-3 gap-y-1">
                {car.year && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {car.year}</span>}
                {car.kms !== null && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {new Intl.NumberFormat('es-ES').format(car.kms)} km</span>}
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
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(car.regularPrice)}
                  </p>
                </div>
              </div>
            </div>
        </div>
    );
}
