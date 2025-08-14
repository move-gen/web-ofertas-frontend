"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CarCard from './CarCard'; 
import { Car } from '@prisma/client';

interface CarWithImages extends Car {
  images: { url: string; isPrimary?: boolean }[];
}

interface InterestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarWithImages;
}

export default function InterestFormModal({ isOpen, onClose, car }: InterestFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 bg-white z-50 p-4 md:p-8 overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 md:top-8 right-4 md:right-8 text-gray-500 hover:text-gray-800 z-10">
            <X size={24} />
          </button>
          
          {/* Layout responsive: arriba-abajo en mobile, izquierda-derecha en desktop */}
          <div className="flex flex-col lg:flex-row h-full pt-16 md:pt-20">
            {/* Formulario - Arriba en mobile, izquierda en desktop */}
            <div className="w-full lg:w-1/2 lg:pr-8 lg:border-r lg:border-gray-200 mb-8 lg:mb-0">
              <div className="lg:hidden mb-4 p-2 bg-blue-50 text-blue-700 text-xs rounded text-center">
                📱 Layout Mobile: Formulario arriba
              </div>
              <div className="hidden lg:block mb-4 p-2 bg-green-50 text-green-700 text-xs rounded text-center">
                🖥️ Layout Desktop: Formulario izquierda
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">¿Interesado?</h2>
              <p className="text-gray-600 mb-6 md:mb-8">Déjanos tus datos y te contactaremos lo antes posible.</p>
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" id="firstName" className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input type="text" id="lastName" className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="mb-4 md:mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="email" className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="mb-4 md:mb-6">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="tel" id="phoneNumber" className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="mb-4 md:mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea id="message" rows={4} className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div className="text-center md:text-right">
                  <button type="submit" className="w-full md:w-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                    Enviar mensaje
                  </button>
                </div>
              </form>
            </div>

            {/* Tarjeta del coche - Abajo en mobile, derecha en desktop */}
            <div className="w-full lg:w-1/2 lg:pl-8 flex items-center justify-center">
              <div className="w-full max-w-lg">
                <div className="lg:hidden mb-4 p-2 bg-blue-50 text-blue-700 text-xs rounded text-center">
                  📱 Layout Mobile: Coche abajo
                </div>
                <div className="hidden lg:block mb-4 p-2 bg-green-50 text-green-700 text-xs rounded text-center">
                  🖥️ Layout Desktop: Coche derecha
                </div>
                <CarCard car={car} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

