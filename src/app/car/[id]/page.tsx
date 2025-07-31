import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Car } from '@/utils/types';
import { Check, Info, Heart, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CarImageGallery from '@/components/CarImageGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  
  const { 
    year, kms, power, fuel, transmission, 
    financedPrice, monthlyFinancingFee, vatDeductible,
    make, model, bodytype, color, doors, seats, engineSize, gears,
    store, city, address, numberplate, guarantee, environmentalBadge,
    equipment, version, name, regularPrice
  } = car;

  const displayFinancedPrice = financedPrice ?? regularPrice;
  const displayKms = kms ?? 0;
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CarImageGallery images={car.images} carName={car.name} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-3xl font-bold">{name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" /> 2 días
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-md text-gray-600">{version}</p>
                  <div className="text-sm text-gray-500 pt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span>{year}</span>
                    <span>| {new Intl.NumberFormat('es-ES').format(displayKms)} km</span>
                    <span>| {power} CV</span>
                    <span>| {fuel}</span>
                    <span>| {transmission}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        Al contado <Info className="ml-1 inline h-4 w-4" />
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(regularPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        Financiado desde <Info className="ml-1 inline h-4 w-4" />
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                         {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(displayFinancedPrice)}
                      </p>
                    </div>
                  </div>

                  <a href="#" className="text-green-600 font-bold text-md hover:underline">
                    Elige tu cuota desde {monthlyFinancingFee}€/mes &gt;
                  </a>

                  <p className="text-xs text-gray-500 mt-2">
                    -2.000€ descuento aplicado. Hasta el 24/08/2025.
                  </p>
                  <p className="text-xs text-gray-500">
                    Transferencia y preparación no incluida: 390€.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 my-4 space-y-2 text-sm">
                    <div className="flex items-start">
                      <img src="/placeholder.svg" alt="Mejor Precio Garantizado" className="w-16 h-16 mr-4"/>
                      <div>
                        <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"/> 15 días o 1.000km para probarlo</div>
                        <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"/> Revisión de 320 puntos del coche</div>
                        <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"/> Garantía fabricante: 1 año y 11 meses</div>
                        <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"/> Entrega a domicilio el viernes</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm">
                    Recógelo GRATIS en nuestros centros o servicio de entrega a domicilio por 99€ (en península).
                  </p>
                  
                  <Button size="lg" className="w-full mt-4 bg-lime-500 hover:bg-lime-600 text-white font-bold text-lg h-12">
                    Me interesa
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">Datos del vehículo*</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 text-base">
            <div><p className="text-gray-600">IVA deducible</p><p className="font-semibold">{vatDeductible ? 'Sí' : 'No'}</p></div>
            <div><p className="text-gray-600">Nº plazas</p><p className="font-semibold">{seats}</p></div>
            <div><p className="text-gray-600">Matriculación</p><p className="font-semibold">{numberplate}</p></div>
            <div><p className="text-gray-600">Próxima revisión</p><p className="font-semibold">11/06/2026</p></div>
            <div><p className="text-gray-600">Tracción</p><p className="font-semibold">Delantera</p></div>
            <div><p className="text-gray-600">Distribución</p><p className="font-semibold">Cadena</p></div>
          </div>
          <p className="text-xs text-gray-500 mt-6">*Para más información, descarga la certificación completa del vehículo.</p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: CarPageProps) {
    const carId = parseInt(params.id, 10);
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car) {
        return { title: 'Coche no encontrado' };
    }
    return { title: car.name, description: car.description || car.name };
}
