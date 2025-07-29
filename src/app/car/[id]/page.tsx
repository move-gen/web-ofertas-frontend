import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Car } from '@/utils/types';
import { Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CarImageGallery from '@/components/CarImageGallery';

type CarPageProps = {
  params: {
    id: string;
  };
};

export default async function CarPage({ params }: CarPageProps) {
  const carId = parseInt(params.id, 10);
  if (isNaN(carId)) {
    notFound();
  }

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      images: {
        orderBy: {
          isPrimary: 'desc',
        }
      },
    },
  });

  if (!car) {
    notFound();
  }
  
  // Directly access properties from the car object
  const { 
    year, kms, power, fuel, transmission, 
    financedPrice, monthlyFinancingFee, vatDeductible,
    make, model, bodytype, color, doors, seats, engineSize, gears,
    store, city, address, numberplate, guarantee, environmentalBadge,
    equipment
  } = car;

  return (
    <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                
                <div className="lg:col-span-2">
                    <CarImageGallery images={car.images} carName={car.name} />
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-8 border rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-900">{car.name}</h1>
                        <p className="text-md text-gray-600 mt-1">{car.version}</p>

                        <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-x-2">
                            {year && <span>{year}</span>}
                            {kms && <span>| {new Intl.NumberFormat('es-ES').format(kms)} km</span>}
                            {power && <span>| {power} CV</span>}
                            {fuel && <span>| {fuel}</span>}
                            {transmission && <span>| {transmission}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 my-6">
                            <div className="text-left">
                                <p className="text-sm text-gray-500">Al contado <Info className="inline h-4 w-4" /></p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.regularPrice)}
                                </p>
                            </div>
                             <div className="text-left">
                                <p className="text-sm text-gray-500">Financiado desde <Info className="inline h-4 w-4" /></p>
                                <p className="text-2xl font-bold text-gray-900">
                                     {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(financedPrice || car.regularPrice)}
                                </p>
                            </div>
                        </div>

                        {monthlyFinancingFee && <p className="text-green-600 font-bold text-md">Elige tu cuota desde {monthlyFinancingFee}€/mes</p>}
                        
                        <div className="bg-gray-100 rounded-lg p-4 my-6 space-y-2 text-sm">
                            <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> 15 días o 1.000km para probarlo</div>
                            {guarantee && <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> {guarantee} meses de garantía</div>}
                            <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> ¡Entrega a domicilio mañana!</div>
                        </div>
                        
                        <Button size="lg" className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg">
                            Me interesa
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="mt-16 pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-6">Datos del vehículo</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        {make && <div><p className="font-semibold text-gray-500">Marca</p><p>{make}</p></div>}
                        {model && <div><p className="font-semibold text-gray-500">Modelo</p><p>{model}</p></div>}
                        {bodytype && <div><p className="font-semibold text-gray-500">Carrocería</p><p>{bodytype}</p></div>}
                        {numberplate && <div><p className="font-semibold text-gray-500">Matrícula</p><p>{numberplate}</p></div>}
                        {year && <div><p className="font-semibold text-gray-500">Año</p><p>{year}</p></div>}
                        {kms && <div><p className="font-semibold text-gray-500">Kilometraje</p><p>{new Intl.NumberFormat('es-ES').format(kms)} km</p></div>}
                        {fuel && <div><p className="font-semibold text-gray-500">Combustible</p><p>{fuel}</p></div>}
                        {power && <div><p className="font-semibold text-gray-500">Potencia</p><p>{power} CV</p></div>}
                        {transmission && <div><p className="font-semibold text-gray-500">Transmisión</p><p>{transmission}</p></div>}
                        {color && <div><p className="font-semibold text-gray-500">Color</p><p>{color}</p></div>}
                        {doors && <div><p className="font-semibold text-gray-500">Puertas</p><p>{doors}</p></div>}
                        {seats && <div><p className="font-semibold text-gray-500">Plazas</p><p>{seats}</p></div>}
                        {engineSize && <div><p className="font-semibold text-gray-500">Cilindrada</p><p>{engineSize} cc</p></div>}
                        {gears && <div><p className="font-semibold text-gray-500">Marchas</p><p>{gears}</p></div>}
                        {vatDeductible && <div><p className="font-semibold text-gray-500">IVA Deducible</p><p>Sí</p></div>}
                    </div>
                </div>
                {equipment && (
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-6">Equipamiento</h2>
                        <p className="text-sm whitespace-pre-line">{equipment}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

// Metadata for SEO
export async function generateMetadata({ params }: CarPageProps) {
    const carId = parseInt(params.id, 10);
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car) {
        return { title: 'Coche no encontrado' };
    }
    return { title: car.name, description: car.description || car.name };
} 