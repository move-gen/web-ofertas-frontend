"use client";

import { useState } from 'react';
import Image from 'next/image';
import { CarImage } from '@/utils/types';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';

interface CarImageGalleryProps {
  images: CarImage[];
  carName: string;
}

export default function CarImageGallery({ images, carName }: CarImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    // Fallback if no images are provided
    return (
        <div className="relative mb-4">
            <Image
                src={'/placeholder.svg'}
                alt="Placeholder Image"
                width={800}
                height={600}
                className="w-full object-cover rounded-lg"
                priority
            />
        </div>
    );
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  }

  return (
    <div>
      {/* Main Image */}
      <div className="relative mb-4 group">
        <Image
          src={images[currentIndex].url}
          alt={carName}
          width={800}
          height={600}
          className="w-full object-cover rounded-lg transition-opacity duration-300"
          priority
          key={currentIndex} // Force re-render on change for transitions
        />
        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white">
            <Heart className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
        {/* Arrows */}
        <button onClick={goToPrevious} className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/60 p-2 rounded-full hover:bg-white transition-opacity opacity-0 group-hover:opacity-100">
            <ChevronLeft className="h-6 w-6" />
        </button>
         <button onClick={goToNext} className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/60 p-2 rounded-full hover:bg-white transition-opacity opacity-0 group-hover:opacity-100">
            <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Thumbnails Carousel */}
      <div className="relative">
         <div className="flex items-center space-x-2 pb-2 overflow-x-auto">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${currentIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => handleThumbnailClick(index)}
                style={{ width: '100px' }}
              >
                <Image
                  src={image.url}
                  alt={`${carName} thumbnail ${index + 1}`}
                  width={100}
                  height={75}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 