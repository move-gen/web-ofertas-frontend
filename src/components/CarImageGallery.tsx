"use client";
import { useState } from 'react';
import Image from 'next/image';
import { CarImage } from '@/utils/types';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface CarImageGalleryProps {
  images: CarImage[];
  carName: string;
}

export default function CarImageGallery({ images, carName }: CarImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[750/421] bg-gray-100 rounded-xl shadow-lg flex items-center justify-center relative">
        <Image src={'/placeholder.svg'} alt="Placeholder Image" width={750} height={421} className="object-cover w-full h-full rounded-xl" priority />
        <span className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">0/0</span>
      </div>
    );
  }

  // Filter out images that have failed to load
  const validImages = images.filter((_, index) => !imageErrors.has(index));
  
  if (validImages.length === 0) {
    return (
      <div className="aspect-[750/421] bg-gray-100 rounded-xl shadow-lg flex items-center justify-center relative">
        <Image src={'/placeholder.svg'} alt="Placeholder Image" width={750} height={421} className="object-cover w-full h-full rounded-xl" priority />
        <span className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">Sin imágenes</span>
      </div>
    );
  }

  const goTo = (idx: number) => setCurrentIndex((idx + validImages.length) % validImages.length);

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
    // If current image fails, move to next valid image
    if (index === currentIndex && validImages.length > 1) {
      const nextIndex = (index + 1) % validImages.length;
      setCurrentIndex(nextIndex);
    }
  };

  return (
    <div>
      {/* Imagen principal */}
      <div className="aspect-[750/421] rounded-xl shadow-lg overflow-hidden relative flex items-center justify-center">
        {/* Flecha izquierda */}
        {validImages.length > 1 && (
          <button 
            onClick={() => goTo(currentIndex - 1)} 
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-100 transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}
        
        {/* Imagen */}
        <Image
          src={validImages[currentIndex].url}
          alt={carName}
          width={750}
          height={421}
          className="object-cover w-full h-full rounded-xl"
          priority
          onError={() => handleImageError(currentIndex)}
        />
        
        {/* Flecha derecha */}
        {validImages.length > 1 && (
          <button 
            onClick={() => goTo(currentIndex + 1)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-100 transition"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}
        
        {/* Contador */}
        <span className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {currentIndex + 1}/{validImages.length}
        </span>
        
        {/* Botón ver interior y zoom */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button className="bg-white/90 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-1 rounded-full shadow text-xs">
            Ver interior
          </button>
          <button className="bg-white/90 hover:bg-blue-100 rounded-full p-2 shadow flex items-center justify-center">
            <ZoomIn className="w-5 h-5 text-blue-700" />
          </button>
        </div>
      </div>
      
      {/* Miniaturas - exactamente como Clicars */}
      {validImages.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide">
          {validImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-20 h-14 rounded-lg border-2 flex-shrink-0 transition-all duration-200 ${
                idx === currentIndex 
                  ? 'border-blue-600 shadow-md scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              } overflow-hidden`}
              aria-label={`Miniatura ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={carName}
                width={80}
                height={56}
                className="object-cover w-full h-full"
                onError={() => handleImageError(idx)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 