import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CarImageGallery from '@/components/CarImageGallery';
import { Info } from 'lucide-react';
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

  // Destructura los datos reales de la DB
  const { 
    make, model, version, year, kms, power, fuel, transmission, 
    regularPrice, financedPrice, monthlyFinancingFee, equipment, 
    seats, doors, color, bodytype, vatDeductible, engineSize, 
    guarantee, store, city, address, numberplate, environmentalBadge 
  } = car;
  
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pt-24">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Columna izquierda: Galería + Datos + Acordeones */}
        <div className="w-full lg:w-2/3">
          {/* Galería */}
          <CarImageGallery images={car.images} carName={`${make} ${model}`} />
          
          {/* Datos del vehículo */}
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Datos del vehículo*</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
              <div>
                <div className="text-xs text-gray-500">IVA deducible</div>
                <div className="text-base font-semibold">{vatDeductible ? 'Sí' : 'No'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Nº plazas</div>
                <div className="text-base font-semibold">{seats}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Matriculación</div>
                <div className="text-base font-semibold">{year}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Puertas</div>
                <div className="text-base font-semibold">{doors}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Color</div>
                <div className="text-base font-semibold">{color}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Carrocería</div>
                <div className="text-base font-semibold">{bodytype}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Kilometraje</div>
                <div className="text-base font-semibold">{kms?.toLocaleString()} km</div>
          </div>
              <div>
                <div className="text-xs text-gray-500">Potencia</div>
                <div className="text-base font-semibold">{power} CV</div>
                    </div>
              <div>
                <div className="text-xs text-gray-500">Combustible</div>
                <div className="text-base font-semibold">{fuel}</div>
                  </div>
              <div>
                <div className="text-xs text-gray-500">Transmisión</div>
                <div className="text-base font-semibold">{transmission}</div>
                  </div>
                    <div>
                <div className="text-xs text-gray-500">Cilindrada</div>
                <div className="text-base font-semibold">{engineSize}</div>
                    </div>
                    <div>
                <div className="text-xs text-gray-500">Matrícula</div>
                <div className="text-base font-semibold">{numberplate || 'N/A'}</div>
                    </div>
                  </div>
            <div className="text-xs text-gray-400 mt-2">*Para más información, descarga la certificación completa del vehículo.</div>
          </section>

          {/* Acordeones de equipamiento */}
          <section className="mt-10">
            <div className="space-y-4">
              {/* Puntos fuertes */}
              <details className="bg-white rounded-lg shadow p-4">
                <summary className="font-bold text-lg cursor-pointer">Puntos fuertes</summary>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li>Motor de última generación con garantía</li>
                  <li>Etiqueta medioambiental {environmentalBadge}</li>
                  <li>Equipamiento completo</li>
                  <li>Garantía: {guarantee || '1 año'}</li>
                  <li>Revisión completa del vehículo</li>
                </ul>
                <button className="text-blue-700 underline text-sm mt-2">Ver todos</button>
              </details>
              
              {/* Equipamiento */}
              <details className="bg-white rounded-lg shadow p-4">
                <summary className="font-bold text-lg cursor-pointer">Equipamiento</summary>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  {equipment?.split(',').map((item, i) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
                </ul>
                <button className="text-blue-700 underline text-sm mt-2">Ver todos</button>
              </details>
              
              {/* Interior */}
              <details className="bg-white rounded-lg shadow p-4">
                <summary className="font-bold text-lg cursor-pointer">Interior</summary>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li>Tapicería de calidad</li>
                  <li>Consola central</li>
                  <li>Volante multifunción</li>
                  <li>Asientos regulables</li>
                </ul>
                <button className="text-blue-700 underline text-sm mt-2">Ver todos</button>
              </details>
              
              {/* Seguridad */}
              <details className="bg-white rounded-lg shadow p-4">
                <summary className="font-bold text-lg cursor-pointer">Seguridad</summary>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li>Sistema de frenado ABS</li>
                  <li>Airbags frontales y laterales</li>
                  <li>Control de estabilidad</li>
                  <li>ISOFIX para sillas infantiles</li>
                </ul>
                <button className="text-blue-700 underline text-sm mt-2">Ver todos</button>
              </details>
              
              {/* Exterior */}
              <details className="bg-white rounded-lg shadow p-4">
                <summary className="font-bold text-lg cursor-pointer">Exterior</summary>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li>Faros LED</li>
                  <li>Luces diurnas</li>
                  <li>Llantas de aleación</li>
                  <li>Color {color}</li>
                </ul>
                <button className="text-blue-700 underline text-sm mt-2">Ver todos</button>
              </details>
              
              {/* Confort */}
              <details className="bg-white rounded-lg shadow p-4">
                <summary className="font-bold text-lg cursor-pointer">Confort</summary>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li>Aire acondicionado</li>
                  <li>Sistema de audio</li>
                  <li>Elevalunas eléctricos</li>
                  <li>Cierre centralizado</li>
                </ul>
                <button className="text-blue-700 underline text-sm mt-2">Ver todos</button>
              </details>
            </div>
          </section>
        </div>

        {/* Columna derecha: Card sticky */}
        <aside className="w-full lg:w-1/3 lg:sticky lg:top-8 h-fit">
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold leading-tight flex-1">{make} {model}</h1>
              <span className="inline-flex items-center gap-1 bg-[#e6f7e6] text-[#1bbf3a] text-xs font-bold px-2 py-1 rounded-full">
                <img src="/icons/24h.svg" alt="24h" className="w-4 h-4"/>
                24h
              </span>
            </div>
            <div className="text-base text-gray-700 font-medium mb-1">{version}</div>
            <div className="text-sm text-gray-500 mb-2">{year} | {kms?.toLocaleString()} km | {power} CV | {fuel} | {transmission}</div>
            
            {/* Iconos destacados */}
            <div className="flex flex-wrap gap-2 mb-4">
              <img src="/icons/c-verde.svg" alt="Etiqueta C" className="w-6 h-6" />
              <img src="/icons/apple_carplay_android_auto.svg" alt="Carplay" className="w-6 h-6" />
              <img src="/icons/bluetooth.svg" alt="Bluetooth" className="w-6 h-6" />
              <img src="/icons/navigator_system.svg" alt="Navegador" className="w-6 h-6" />
              <img src="/icons/prevencion_de_colision.svg" alt="Colisión" className="w-6 h-6" />
              <img src="/icons/ayuda_mantenimiento_carril.svg" alt="Carril" className="w-6 h-6" />
              <img src="/icons/faros_led.svg" alt="Faros LED" className="w-6 h-6" />
              <img src="/icons/usb_c.svg" alt="USB-C" className="w-6 h-6" />
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
                  Financiado desde <Info className="w-4 h-4 text-gray-400" />
                      </div>
                <div className="text-2xl font-bold text-blue-700">{financedPrice?.toLocaleString()}€</div>
                    </div>
                  </div>

            <a href="#" className="block text-blue-700 underline text-sm font-semibold mb-2">
              Elige tu cuota desde <span className="font-bold">{monthlyFinancingFee}€</span>/mes &gt;
            </a>
            
            <div className="text-green-600 text-sm mb-2 font-semibold">-1.000€ descuento aplicado. Hasta el 24/08/2025.</div>
            
            {/* Características */}
            <div className="bg-gray-50 rounded-lg p-4 mb-2">
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <img src="/icons/check.svg" className="w-5 h-5" alt="check" />
                  15 días o 1.000km para probarlo
                </li>
                <li className="flex items-center gap-2">
                  <img src="/icons/check.svg" className="w-5 h-5" alt="check" />
                  Revisión de 320 puntos del coche
                </li>
                <li className="flex items-center gap-2">
                  <img src="/icons/check.svg" className="w-5 h-5" alt="check" />
                  Garantía fabricante: {guarantee || '1 año y 7 meses'}
                </li>
                <li className="flex items-center gap-2">
                  <img src="/icons/check.svg" className="w-5 h-5" alt="check" />
                  ¡Entrega a domicilio mañana!
                </li>
              </ul>
            </div>
            
            <div className="text-xs text-gray-600 mb-4">
              Recógelo GRATIS en nuestros centros o servicio de entrega a domicilio por 99€ (en península).
        </div>
        
            <Button className="w-full h-12 text-lg font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md mt-2">
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
