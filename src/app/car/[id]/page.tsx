import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CarImageGallery from '@/components/CarImageGallery';
import { 
    Info, Wifi, Bluetooth, Navigation, Siren, Wrench, Sparkles, Usb, Check, Calendar, Gauge, Power, Fuel, GitCommitHorizontal,
    Car, Users, DoorOpen, Palette, Milestone, Cog, BadgeHelp, ShieldCheck, Star, CircleHelp, HandCoins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CarPageProps {
  params: { id: string };
}

export default async function CarPage({ params }: CarPageProps) {
  const carId = parseInt(params.id, 10);
  if (isNaN(carId)) notFound();

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { images: { orderBy: { isPrimary: 'desc' } } },
  });
  
  if (!car) notFound();

  const { 
    make, model, version, year, kms, power, fuel, transmission, 
    regularPrice, financedPrice, monthlyFinancingFee, equipment, 
    seats, doors, color, bodytype, vatDeductible, engineSize, 
    guarantee, store, city, address, numberplate, environmentalBadge 
  } = car;

  const features = [
    { icon: <Calendar size={20} className="text-blue-700" />, label: 'Matriculación', value: year },
    { icon: <Milestone size={20} className="text-blue-700" />, label: 'Kilometraje', value: `${kms?.toLocaleString()} km` },
    { icon: <Power size={20} className="text-blue-700" />, label: 'Potencia', value: `${power} CV` },
    { icon: <Fuel size={20} className="text-blue-700" />, label: 'Combustible', value: fuel },
    { icon: <GitCommitHorizontal size={20} className="text-blue-700" />, label: 'Transmisión', value: transmission },
    { icon: <Car size={20} className="text-blue-700" />, label: 'Carrocería', value: bodytype },
    { icon: <Users size={20} className="text-blue-700" />, label: 'Plazas', value: seats },
    { icon: <DoorOpen size={20} className="text-blue-700" />, label: 'Puertas', value: doors },
    { icon: <Palette size={20} className="text-blue-700" />, label: 'Color', value: color },
    { icon: <Cog size={20} className="text-blue-700" />, label: 'Cilindrada', value: `${engineSize} cc` },
    { icon: <BadgeHelp size={20} className="text-blue-700" />, label: 'Matrícula', value: numberplate || 'N/A' },
    { icon: <HandCoins size={20} className="text-blue-700" />, label: 'IVA Deducible', value: vatDeductible ? 'Sí' : 'No' }
  ];

  const mainFeatures = [
    { icon: <BadgeHelp size={24} className="text-blue-700" />, name: `Etiqueta ${environmentalBadge}` },
    { icon: <Wifi size={24} className="text-blue-700" />, name: 'CarPlay/Android Auto' },
    { icon: <Bluetooth size={24} className="text-blue-700" />, name: 'Bluetooth' },
    { icon: <Navigation size={24} className="text-blue-700" />, name: 'Navegador' },
    { icon: <Siren size={24} className="text-blue-700" />, name: 'Prevención Colisión' },
    { icon: <Wrench size={24} className="text-blue-700" />, name: 'Mantenimiento Carril' },
    { icon: <Sparkles size={24} className="text-blue-700" />, name: 'Faros LED' },
    { icon: <Usb size={24} className="text-blue-700" />, name: 'USB-C' }
  ];
  
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pt-24">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Columna izquierda: Galería + Datos + Acordeones */}
        <div className="w-full lg:w-2/3">
          {/* Galería */}
          <CarImageGallery images={car.images} carName={`${make} ${model}`} />
          
          {/* Datos del vehículo */}
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Datos del vehículo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {features.map(feature => (
                <div key={feature.label} className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                        <div className="text-xs text-gray-500">{feature.label}</div>
                        <div className="text-base font-semibold">{feature.value}</div>
                    </div>
                </div>
              ))}
            </div>
          </section>

          {/* Acordeones de equipamiento */}
          <section className="mt-10">
            <div className="space-y-4">
              <details className="bg-white rounded-lg shadow p-4">
                <summary className="font-bold text-lg cursor-pointer flex items-center gap-2"><Star className="text-blue-700" /> Puntos fuertes</summary>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li>Motor de última generación con garantía</li>
                  <li>Etiqueta medioambiental {environmentalBadge}</li>
                  <li>Equipamiento completo</li>
                  <li>Garantía: {guarantee || '1 año'}</li>
                  <li>Revisión completa del vehículo</li>
                </ul>
              </details>
              
              <details className="bg-white rounded-lg shadow p-4">
                <summary className="font-bold text-lg cursor-pointer flex items-center gap-2"><Wrench className="text-blue-700" /> Equipamiento</summary>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  {equipment?.split(',').map((item, i) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
                </ul>
              </details>
            </div>
          </section>
        </div>

        {/* Columna derecha: Card sticky */}
        <aside className="w-full lg:w-1/3 lg:sticky lg:top-8 h-fit">
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
            <h1 className="text-2xl font-bold leading-tight flex-1">{make} {model}</h1>
            <div className="text-base text-gray-700 font-medium mb-1">{version}</div>
            <div className="text-sm text-gray-500 mb-4">{year} | {kms?.toLocaleString()} km | {power} CV</div>
            
            {/* Iconos destacados */}
            <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                {mainFeatures.map(feature => (
                    <div key={feature.name} className="flex flex-col items-center gap-1">
                        {feature.icon}
                        <span className="text-xs">{feature.name}</span>
                    </div>
                ))}
            </div>
            
            {/* Precios */}
            <div className="flex gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-1">
                  Al contado <Info className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{regularPrice?.toLocaleString()}€</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-1">
                  Financiado <Info className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-blue-700">{financedPrice?.toLocaleString()}€</div>
              </div>
            </div>

            <a href="#" className="block text-blue-700 underline text-sm font-semibold mb-2">
              Elige tu cuota desde <span className="font-bold">{monthlyFinancingFee}€</span>/mes
            </a>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-2 mt-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><ShieldCheck className="text-blue-700" /> 15 días o 1.000km para probarlo</li>
                <li className="flex items-center gap-2"><ShieldCheck className="text-blue-700" /> Revisión de 320 puntos</li>
                <li className="flex items-center gap-2"><ShieldCheck className="text-blue-700" /> Garantía: {guarantee || '1 año y 7 meses'}</li>
                <li className="flex items-center gap-2"><ShieldCheck className="text-blue-700" /> ¡Entrega a domicilio mañana!</li>
              </ul>
            </div>
            
            <Button className="w-full h-12 text-lg font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md mt-4">
              Me interesa
            </Button>
          </div>
        </aside>
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
