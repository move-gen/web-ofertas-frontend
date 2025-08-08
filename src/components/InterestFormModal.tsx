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
          className="fixed inset-0 bg-white z-50 p-8 flex"
        >
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-gray-800 z-10">
            <X size={24} />
          </button>
          
          <div className="w-1/2 pr-8 border-r border-gray-200">
            <h2 className="text-3xl font-bold mb-6">¿Interesado?</h2>
            <p className="text-gray-600 mb-8">Déjanos tus datos y te contactaremos lo antes posible.</p>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" id="firstName" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input type="text" id="lastName" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" id="phoneNumber" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea id="message" rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div className="text-right">
                <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                  Enviar mensaje
                </button>
              </div>
            </form>
          </div>

          <div className="w-1/2 pl-8 flex items-center justify-center">
            <div className="w-full max-w-lg">
                <CarCard car={car} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

