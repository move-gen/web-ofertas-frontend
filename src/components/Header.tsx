"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, User, ChevronDown } from 'lucide-react';
import { getToken, logout } from '@/utils/auth';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    // Optionally, redirect to home or login page
    window.location.href = '/';
  };

  return (
    <header className="bg-[#2364c4] text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center h-12"> {/* Adjusted container height */}
              <Image src="/logo-200x50.png" alt="MiguelLeón Logo" width={200} height={50} priority /> {/* Using the correct image and dimensions */}
            </div>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:underline text-sm">
              Inicio
            </Link>
            <Link href="/offers" className="hover:underline text-sm">
              Ofertas
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/admin/importer" className="hover:underline text-sm text-cyan-300">
                  Importar CSV
                </Link>
                <Link href="/admin/offer-creator" className="hover:underline text-sm text-cyan-300">
                  Crear Oferta
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-5 h-5" />
          <div className="flex items-center space-x-1 cursor-pointer">
            <User className="w-5 h-5" />
            <ChevronDown className="w-4 h-4" />
            {isAuthenticated && (
              <button onClick={handleLogout} className="text-sm ml-2 hover:underline">(Logout)</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 