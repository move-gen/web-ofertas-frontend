"use client";

interface ImageCropperProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

export default function ImageCropper({ 
  src, 
  alt, 
  className = "", 
  onError
}: ImageCropperProps) {
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      style={{
        objectFit: 'contain',
        objectPosition: 'center',
        width: '100%',
        height: '100%'
      }}
    />
  );
}
