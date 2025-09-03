"use client";
import { useState, useEffect, useRef } from 'react';

interface ImageCropperProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  autoDetect?: boolean; // Si debe detectar automáticamente los bordes
  cropTop?: number; // Porcentaje del borde superior a recortar (fallback)
  cropBottom?: number; // Porcentaje del borde inferior a recortar (fallback)
}

// Función para detectar si un color es azul (borde)
function isBlueBorder(r: number, g: number, b: number): boolean {
  // Detectar colores azules (b > r y b > g, y con cierta intensidad)
  return b > r + 30 && b > g + 30 && b > 100;
}

// Función para detectar automáticamente los bordes azules
function detectBlueBorders(imageData: ImageData, width: number, height: number) {
  const data = imageData.data;
  let topBorder = 0;
  let bottomBorder = 0;
  
  // Detectar borde superior
  for (let y = 0; y < height * 0.3; y++) { // Solo revisar el 30% superior
    let bluePixels = 0;
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      if (isBlueBorder(r, g, b)) {
        bluePixels++;
      }
    }
    
    // Si más del 60% de los píxeles de esta fila son azules, es borde
    if (bluePixels / width > 0.6) {
      topBorder = y;
    } else {
      break; // Ya no hay borde azul
    }
  }
  
  // Detectar borde inferior
  for (let y = height - 1; y > height * 0.7; y--) { // Solo revisar el 30% inferior
    let bluePixels = 0;
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      if (isBlueBorder(r, g, b)) {
        bluePixels++;
      }
    }
    
    // Si más del 60% de los píxeles de esta fila son azules, es borde
    if (bluePixels / width > 0.6) {
      bottomBorder = height - y - 1;
    } else {
      break; // Ya no hay borde azul
    }
  }
  
  return { topBorder, bottomBorder };
}

export default function ImageCropper({ 
  src, 
  alt, 
  className = "", 
  onError,
  autoDetect = true, // Por defecto detectar automáticamente
  cropTop = 20, // Fallback si no se puede detectar
  cropBottom = 10 // Fallback si no se puede detectar
}: ImageCropperProps) {
  const [croppedSrc, setCroppedSrc] = useState<string>(src);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!src) return;

    const processImage = async () => {
      setIsProcessing(true);
      
      try {
        // Crear una imagen para cargar el src
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const originalWidth = img.width;
          const originalHeight = img.height;
          
          let cropTopPixels = 0;
          let cropBottomPixels = 0;
          
          if (autoDetect) {
            // Crear un canvas temporal para analizar la imagen
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCanvas.width = originalWidth;
              tempCanvas.height = originalHeight;
              tempCtx.drawImage(img, 0, 0);
              
              // Obtener datos de píxeles
              const imageData = tempCtx.getImageData(0, 0, originalWidth, originalHeight);
              
              // Detectar bordes azules
              const { topBorder, bottomBorder } = detectBlueBorders(imageData, originalWidth, originalHeight);
              
              cropTopPixels = topBorder;
              cropBottomPixels = bottomBorder;
              
              console.log(`Detectados bordes: superior=${topBorder}px, inferior=${bottomBorder}px`);
            }
          }
          
          // Si no se detectaron bordes o falló la detección, usar valores por defecto
          if (cropTopPixels === 0 && cropBottomPixels === 0) {
            cropTopPixels = Math.floor((originalHeight * cropTop) / 100);
            cropBottomPixels = Math.floor((originalHeight * cropBottom) / 100);
            console.log(`Usando valores por defecto: superior=${cropTopPixels}px, inferior=${cropBottomPixels}px`);
          }
          
          // Dimensiones finales después del recorte
          const croppedHeight = originalHeight - cropTopPixels - cropBottomPixels;
          const croppedWidth = originalWidth;
          
          // Configurar el canvas final
          canvas.width = croppedWidth;
          canvas.height = croppedHeight;
          
          // Dibujar la imagen recortada
          ctx.drawImage(
            img,
            0, cropTopPixels, // x, y de origen (recortar desde arriba)
            croppedWidth, croppedHeight, // ancho y alto del área a copiar
            0, 0, // x, y de destino en el canvas
            croppedWidth, croppedHeight // ancho y alto de destino
          );
          
          // Convertir a data URL
          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCroppedSrc(croppedDataUrl);
          setIsProcessing(false);
        };

        img.onerror = () => {
          console.error('Error al cargar la imagen para recorte');
          setCroppedSrc(src); // Usar imagen original si falla el recorte
          setIsProcessing(false);
          onError?.();
        };

        img.src = src;
      } catch (error) {
        console.error('Error en el procesamiento de imagen:', error);
        setCroppedSrc(src); // Usar imagen original si falla el recorte
        setIsProcessing(false);
        onError?.();
      }
    };

    processImage();
  }, [src, autoDetect, cropTop, cropBottom, onError]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <img
        src={croppedSrc}
        alt={alt}
        className={`${className} ${isProcessing ? 'opacity-50' : ''}`}
        onError={onError}
      />
    </>
  );
}
