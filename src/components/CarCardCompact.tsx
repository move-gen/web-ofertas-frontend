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
        margin: '-8px',
        aspectRatio: '1 / 1'
      }}
    >
      {/* PARTE SUPERIOR: Imagen Completa - Mitad superior */}
      <div className="w-full relative" style={{ height: '50%', flexShrink: 0 }}>
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

      {/* PARTE INFERIOR: Información - Mitad inferior compacta */}
      <div className="px-4 py-2 flex flex-col justify-between" style={{ height: '50%', flexShrink: 0 }}>
        {/* Cabecera: Nombre y Cuota */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-[#0f172a] font-bold text-xl leading-tight mb-0.5 truncate">{modelName}</h2>
            {version && (
              <p className="text-gray-500 text-xs font-normal truncate">{version}</p>
            )}
          </div>
          
          {/* Etiqueta de Cuota */}
          <div className="text-right flex flex-col items-end flex-shrink-0">
            <p className="text-[#2b5ba9] text-xs font-medium mb-0.5 whitespace-nowrap">Cuota desde</p>
            <div 
              className="bg-[#2b5ba9] text-white py-1 px-3 rounded-l-full flex items-baseline shadow-sm whitespace-nowrap" 
              style={{ marginRight: '-16px' }}
            >
              <span className="font-bold text-lg mr-1">{monthlyPayment} €</span>
              <span className="text-[10px] font-light">mes</span>
            </div>
          </div>
        </div>

        {/* Divisor Fino */}
        <hr className="border-gray-200 my-1.5" />

        {/* Iconos y Características */}
        <div className="grid grid-cols-4 gap-1 text-center">
          {/* Año */}
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="material-symbols-outlined text-[#2b5ba9]" style={{ fontSize: '18px' }}>calendar_today</span>
            <span className="text-gray-500 text-[11px] font-medium">
              {car.year || 'N/A'}
            </span>
          </div>
          
          {/* Kilómetros */}
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="material-symbols-outlined text-[#2b5ba9]" style={{ fontSize: '18px' }}>speed</span>
            <span className="text-gray-500 text-[11px] font-medium whitespace-nowrap">
              {car.kms !== null && car.kms !== undefined ? `${formatKms(car.kms)} km` : 'N/A'}
            </span>
          </div>

          {/* Transmisión */}
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="material-symbols-outlined text-[#2b5ba9]" style={{ fontSize: '18px' }}>account_tree</span>
            <span className="text-gray-500 text-[11px] font-medium">
              {car.transmission || 'N/A'}
            </span>
          </div>

          {/* Combustible */}
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: '18px' }}>eco</span>
            <span className="text-gray-500 text-[11px] font-medium">
              {car.fuel || 'N/A'}
            </span>
          </div>
        </div>

        {/* Divisor Fino */}
        <hr className="border-gray-200 my-1.5" />

        {/* Precios */}
        <div className="flex justify-between items-end">
          {/* Precio Contado */}
          <div className="text-left">
            <p className="text-gray-400 text-[11px] leading-none font-light mb-0.5">Precio Contado</p>
            <span className="text-[#333] text-xl font-normal tracking-tight leading-none">
              {formatPrice(car.regularPrice)}
            </span>
          </div>

          {/* Precio Financiado */}
          <div className="text-right">
            <p className="text-gray-400 text-[11px] leading-none font-light mb-0.5">Precio Financiado</p>
            <span className="text-[#2b5ba9] text-xl font-bold tracking-tight leading-none">
              {formatPrice(car.financedPrice || car.regularPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

