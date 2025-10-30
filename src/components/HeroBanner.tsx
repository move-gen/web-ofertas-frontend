"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
      {/* Main Banner Image con bordes redondeados inferiores */}
      <Image
        src="/fondo de pantalla.png"
        alt="Banner Miguel León - Las mejores ofertas de coches en Canarias"
        fill
        className="object-contain rounded-b-[40px]"
        priority
        sizes="100vw"
        quality={100}
        unoptimized
      />
      
      {/* Logo eliminado - ya está en el header */}

      {/* Ver Catálogo Button (centrado) */}
      <div className="absolute z-20 h-[40px] left-1/2 -translate-x-1/2 bottom-[40px] w-[160px] max-md:bottom-[50px] max-md:w-[140px] max-sm:text-xs max-sm:w-[120px]">
        <Link href="/buscador">
          <Button 
            variant="outline" 
            className="w-full h-full rounded-full border-white bg-transparent text-white hover:bg-white/10 flex items-center justify-center gap-2 text-xs"
          >
            <span className="tracking-tight">Ver Catálogo</span>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.35355 4.35355C9.54882 4.15829 9.54882 3.84171 9.35355 3.64645L6.17157 0.464466C5.97631 0.269204 5.65973 0.269204 5.46447 0.464466C5.2692 0.659728 5.2692 0.976311 5.46447 1.17157L8.29289 4L5.46447 6.82843C5.2692 7.02369 5.2692 7.34027 5.46447 7.53553C5.65973 7.7308 5.97631 7.7308 6.17157 7.53553L9.35355 4.35355ZM0 4L0 4.5H9V4V3.5H0L0 4Z" fill="white"/>
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}
