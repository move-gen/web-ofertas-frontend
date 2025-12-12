"use client";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface Car {
  id: number;
  name: string;
  year: number | null;
  kms: number | null;
  transmission: string | null;
  fuel: string | null;
  regularPrice: number;
  financedPrice?: number | null;
  images: { url: string; isPrimary?: boolean }[];
  offerImageUrl?: string | null;
  isSold?: boolean;
  monthlyFinancingFee?: number | null; // Para compatibilidad con CarData y Prisma (puede ser null)
}

interface CarCardCompactProps {
  car: Car;
}

export default function CarCardCompact({ car }: CarCardCompactProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
  });

  const [imageError, setImageError] = useState(false);

  // Priorizar la imagen de oferta si existe, sino usar la imagen principal
  const displayImage = car.offerImageUrl || 
    (car.images && car.images.length > 0 
      ? (car.images.find(img => img.isPrimary) || car.images[0])?.url 
      : null);

  useEffect(() => {
    if (displayImage) {
      const img = new window.Image();
      img.src = displayImage;
      img.onerror = () => {
        setImageError(true);
      };
    }
  }, [displayImage]);

  // Calcular cuota mensual (precio financiado / 72 meses)
  // Si tiene monthlyFinancingFee (de CarData), usarlo directamente
  // Verificar explícitamente que sea un número (incluyendo 0) en lugar de verificación truthy
  // monthlyFinancingFee puede ser number | null | undefined
  const monthlyPayment = typeof car.monthlyFinancingFee === 'number'
    ? car.monthlyFinancingFee.toFixed(0)
    : car.financedPrice 
      ? (car.financedPrice / 72).toFixed(0) 
      : (car.regularPrice / 72).toFixed(0);

  // Extraer nombre del modelo y versión del nombre completo
  // Intentar separar por el patrón común: marca modelo versión
  const nameParts = car.name.split(' ');
  let modelName = car.name;
  let version = '';
  
  // Si tiene más de 2 palabras, asumir que las primeras 2-3 son el modelo
  if (nameParts.length > 3) {
    modelName = nameParts.slice(0, 3).join(' ');
    version = nameParts.slice(3).join(' ');
  } else if (nameParts.length > 2) {
    modelName = nameParts.slice(0, 2).join(' ');
    version = nameParts.slice(2).join(' ');
  }

  // Formatear precios (formato: 18.985 €)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price) + ' €';
  };

  // Formatear kilómetros
  const formatKms = (kms: number | null) => {
    if (kms === null) return '';
    return new Intl.NumberFormat('es-ES').format(kms);
  };

  return (
    <div
      ref={ref}
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col w-full max-w-[400px] mx-auto"
      style={{ 
        aspectRatio: '1 / 1',
        margin: '-8px'
      }}
    >
      {/* PARTE SUPERIOR: Imagen Completa - 65% de la altura total */}
      <div className="w-full relative" style={{ height: '65%', flexShrink: 0 }}>
        {displayImage && !imageError && inView ? (
          <Image
            src={displayImage}
            alt={car.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            onError={() => {
              setImageError(true);
            }}
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Image
              src="/placeholder.svg"
              alt="Placeholder"
              width={200}
              height={150}
              className="object-contain opacity-50"
              priority={false}
            />
          </div>
        )}
        
        {car.isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white/90 px-6 py-2 rounded-md border-4 border-[#0f286a] transform -rotate-12">
              <span className="text-4xl font-extrabold uppercase tracking-widest text-[#0f286a]">
                Vendido
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PARTE INFERIOR: Información - 35% de la altura total */}
      <div className="pl-5 pr-5 pt-2 pb-4" style={{ height: '35%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Cabecera: Nombre y Cuota */}
        <div className="flex justify-between items-start mb-[2%] relative flex-shrink-0">
          <div className="flex-1 pr-2 pt-[2%]">
            <h2 className="text-[#0f172a] font-bold text-[clamp(1.25rem,6vw,1.5rem)] leading-none mb-[2%]">{modelName}</h2>
            {version && (
              <p className="text-gray-500 text-[clamp(0.75rem,3.5vw,0.875rem)] font-normal">{version}</p>
            )}
          </div>
          
          {/* Etiqueta de Cuota */}
          <div className="text-right flex flex-col items-end flex-shrink-0">
            <p className="text-[#2b5ba9] text-[clamp(0.75rem,3.5vw,0.875rem)] font-medium mb-[2%]">Cuota desde</p>
            <div 
              className="bg-[#2b5ba9] text-white py-[3%] pl-5 pr-5 rounded-l-full flex items-baseline shadow-sm whitespace-nowrap" 
              style={{ marginRight: '-20px' }}
            >
              <span className="font-bold text-[clamp(1.25rem,6vw,1.5rem)] mr-1">{monthlyPayment} €</span>
              <span className="text-[clamp(0.625rem,3vw,0.75rem)] font-light relative -top-1">mes</span>
            </div>
          </div>
        </div>

        {/* Divisor Fino */}
        <hr className="border-gray-200 mb-[4%] mt-[2%] flex-shrink-0" />

        {/* Iconos y Características */}
        <div className="grid grid-cols-4 gap-2 text-center mb-[4%] text-[#555] flex-shrink-0">
          {/* Año */}
          <div className="flex flex-col items-center justify-center gap-[2px]">
            <span className="material-symbols-outlined text-[#2b5ba9]" style={{ fontSize: 'clamp(16px, 5vw, 20px)' }}>calendar_today</span>
            <span className="text-gray-500 text-[clamp(0.7rem,3.25vw,0.8125rem)] font-medium">
              {car.year || 'N/A'}
            </span>
          </div>
          
          {/* Kilómetros */}
          <div className="flex flex-col items-center justify-center gap-[2px]">
            <span className="material-symbols-outlined text-[#2b5ba9]" style={{ fontSize: 'clamp(16px, 5vw, 20px)' }}>speed</span>
            <span className="text-gray-500 text-[clamp(0.7rem,3.25vw,0.8125rem)] font-medium whitespace-nowrap">
              {car.kms !== null && car.kms !== undefined ? `${formatKms(car.kms)} km` : 'N/A'}
            </span>
          </div>

          {/* Transmisión */}
          <div className="flex flex-col items-center justify-center gap-[2px]">
            <span className="material-symbols-outlined text-[#2b5ba9]" style={{ fontSize: 'clamp(16px, 5vw, 20px)' }}>account_tree</span>
            <span className="text-gray-500 text-[clamp(0.7rem,3.25vw,0.8125rem)] font-medium">
              {car.transmission || 'N/A'}
            </span>
          </div>

          {/* Combustible */}
          <div className="flex flex-col items-center justify-center gap-[2px]">
            <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: 'clamp(16px, 5vw, 20px)' }}>eco</span>
            <span className="text-gray-500 text-[clamp(0.7rem,3.25vw,0.8125rem)] font-medium">
              {car.fuel || 'N/A'}
            </span>
          </div>
        </div>

        {/* Divisor Fino */}
        <hr className="border-gray-200 mb-[6%] flex-shrink-0" />

        {/* Precios */}
        <div className="flex justify-between items-end px-1 mt-auto">
          {/* Precio Contado */}
          <div className="text-left">
            <p className="text-gray-400 text-[clamp(0.7rem,3.25vw,0.8125rem)] mb-0 leading-none font-light">Precio Contado</p>
            <span className="text-[#333] text-[clamp(1.375rem,6.5vw,1.625rem)] font-normal tracking-tight leading-tight">
              {formatPrice(car.regularPrice)}
            </span>
          </div>

          {/* Precio Financiado */}
          <div className="text-right">
            <p className="text-gray-400 text-[clamp(0.7rem,3.25vw,0.8125rem)] mb-0 leading-none font-light">Precio Financiado</p>
            <span className="text-[#2b5ba9] text-[clamp(1.375rem,6.5vw,1.625rem)] font-bold tracking-tight leading-tight">
              {formatPrice(car.financedPrice || car.regularPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

