"use client";
import { useState } from 'react';
import Image from 'next/image';

interface PromotionalBannerProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  size: 'small' | 'medium' | 'large';
}

export default function PromotionalBanner({ 
  imageUrl, 
  title, 
  subtitle, 
  size 
}: PromotionalBannerProps) {
  const [imageError, setImageError] = useState(false);

  // Configuración de tamaños responsive
  const sizeConfig = {
    small: {
      container: 'h-64 md:h-80',
      image: 'h-48 md:h-64',
      title: 'text-2xl md:text-3xl',
      subtitle: 'text-sm md:text-base'
    },
    medium: {
      container: 'h-80 md:h-96',
      image: 'h-64 md:h-80',
      title: 'text-3xl md:text-4xl',
      subtitle: 'text-base md:text-lg'
    },
    large: {
      container: 'h-96 md:h-[28rem]',
      image: 'h-80 md:h-96',
      title: 'text-4xl md:text-5xl',
      subtitle: 'text-lg md:text-xl'
    }
  };

  const config = sizeConfig[size];

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative w-full ${config.container} bg-white overflow-hidden`}>
      {/* Imagen de fondo */}
      <div className={`relative w-full ${config.image} flex items-center justify-center`}>
        {!imageError ? (
          imageUrl.startsWith('data:') ? (
            // Imagen base64 (desarrollo)
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          ) : (
            // Imagen URL (producción con Vercel Blob)
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain"
              onError={handleImageError}
              priority
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Error al cargar imagen</span>
          </div>
        )}
      </div>

      {/* Overlay de texto */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 md:p-6 max-w-2xl">
          {/* Título principal */}
          <h1 className={`font-bold text-blue-900 mb-2 ${config.title}`}>
            {title}
          </h1>
          
          {/* Subtítulo */}
          <p className={`text-blue-800 font-medium ${config.subtitle}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
