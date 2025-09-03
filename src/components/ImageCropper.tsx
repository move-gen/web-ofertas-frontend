"use client";

interface ImageCropperProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  cropTop?: number; // Porcentaje del borde superior a recortar
  cropBottom?: number; // Porcentaje del borde inferior a recortar
}

export default function ImageCropper({ 
  src, 
  alt, 
  className = "", 
  onError,
  cropTop = 10, // Recortar 10% del borde superior
  cropBottom = 10 // Recortar 10% del borde inferior
}: ImageCropperProps) {
  
  // Calcular los valores de clip-path para recortar la imagen
  const topPercent = cropTop;
  const bottomPercent = cropBottom;
  
  // Crear el clip-path que recorta los bordes superior e inferior
  const clipPath = `inset(${topPercent}% 0 ${bottomPercent}% 0)`;
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      style={{
        clipPath: clipPath,
        objectFit: 'cover',
        objectPosition: 'center',
        width: '100%',
        height: '100%'
      }}
    />
  );
}
