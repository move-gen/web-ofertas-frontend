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
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col"
      style={{ 
        width: '400px', 
        height: '400px',
        maxWidth: '400px',
        margin: '-8px' // Compensa el p-2 (8px) del contenedor <a>
      }}
    >
      {/* PARTE SUPERIOR: Imagen Completa - 260px exactos (65% de 400px) */}
      <div className="w-full relative flex-shrink-0" style={{ height: '260px', width: '100%' }}>
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

      {/* PARTE INFERIOR: Información - Optimizado para 140px */}
      <div className="pl-5 pr-5 pt-2 pb-4 flex flex-col justify-between flex-shrink-0 overflow-hidden" style={{ height: '140px' }}>
        {/* Cabecera: Nombre y Cuota */}
        <div className="flex justify-between items-start relative" style={{ marginBottom: '4px' }}>
          <div className="flex-1 pr-2" style={{ paddingTop: '4px' }}>
            <h2 className="text-[#0f172a] font-bold leading-none" style={{ fontSize: '24px', marginBottom: '4px', lineHeight: '1' }}>{modelName}</h2>
            {version && (
              <p className="text-gray-500 font-normal" style={{ fontSize: '14px', lineHeight: '1.2' }}>{version}</p>
            )}
          </div>
          
          {/* Etiqueta de Cuota */}
          <div className="text-right flex flex-col items-end">
            <p className="text-[#2b5ba9] font-medium" style={{ fontSize: '14px', marginBottom: '4px' }}>Cuota desde</p>
            <div 
              className="bg-[#2b5ba9] text-white pl-5 pr-5 rounded-l-full flex items-baseline shadow-sm" 
              style={{ marginRight: '-20px', paddingTop: '6px', paddingBottom: '6px' }}
            >
              <span className="font-bold mr-1" style={{ fontSize: '24px' }}>{monthlyPayment} €</span>
              <span className="font-light relative -top-1" style={{ fontSize: '12px' }}>mes</span>
            </div>
          </div>
        </div>

        {/* Divisor Fino */}
        <hr className="border-gray-200" style={{ marginTop: '4px', marginBottom: '8px' }} />

        {/* Iconos y Características */}
        <div className="grid grid-cols-4 gap-2 text-center" style={{ marginBottom: '8px' }}>
          {/* Año */}
          <div className="flex flex-col items-center justify-center" style={{ gap: '4px' }}>
            <span className="material-symbols-outlined text-[#2b5ba9]">calendar_today</span>
            <span className="text-gray-500 font-medium" style={{ fontSize: '13px', lineHeight: '1.2' }}>
              {car.year || 'N/A'}
            </span>
          </div>
          
          {/* Kilómetros */}
          <div className="flex flex-col items-center justify-center" style={{ gap: '4px' }}>
            <span className="material-symbols-outlined text-[#2b5ba9]">speed</span>
            <span className="text-gray-500 font-medium whitespace-nowrap" style={{ fontSize: '13px', lineHeight: '1.2' }}>
              {car.kms !== null && car.kms !== undefined ? `${formatKms(car.kms)} km` : 'N/A'}
            </span>
          </div>

          {/* Transmisión */}
          <div className="flex flex-col items-center justify-center" style={{ gap: '4px' }}>
            <span className="material-symbols-outlined text-[#2b5ba9]">account_tree</span>
            <span className="text-gray-500 font-medium" style={{ fontSize: '13px', lineHeight: '1.2' }}>
              {car.transmission || 'N/A'}
            </span>
          </div>

          {/* Combustible */}
          <div className="flex flex-col items-center justify-center" style={{ gap: '4px' }}>
            <span className="material-symbols-outlined text-emerald-500">eco</span>
            <span className="text-gray-500 font-medium" style={{ fontSize: '13px', lineHeight: '1.2' }}>
              {car.fuel || 'N/A'}
            </span>
          </div>
        </div>

        {/* Divisor Fino */}
        <hr className="border-gray-200" style={{ marginTop: '4px', marginBottom: '12px' }} />

        {/* Precios */}
        <div className="flex justify-between items-end px-1">
          {/* Precio Contado */}
          <div className="text-left">
            <p className="text-gray-400 mb-0 leading-none font-light" style={{ fontSize: '13px' }}>Precio Contado</p>
            <span className="text-[#333] font-normal tracking-tight" style={{ fontSize: '26px', lineHeight: '1.2' }}>
              {formatPrice(car.regularPrice)}
            </span>
          </div>

          {/* Precio Financiado */}
          <div className="text-right">
            <p className="text-gray-400 mb-0 leading-none font-light" style={{ fontSize: '13px' }}>Precio Financiado</p>
            <span className="text-[#2b5ba9] font-bold tracking-tight" style={{ fontSize: '26px', lineHeight: '1.2' }}>
              {formatPrice(car.financedPrice || car.regularPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

