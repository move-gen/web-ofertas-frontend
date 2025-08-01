"use client";
import Link from 'next/link';
import { Search, Globe, Menu } from 'lucide-react';
import Image from 'next/image';

export default function HeaderLanding() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 text-white p-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center h-12">
                <Image src="/logo-200x50.png" alt="MiguelLeón Logo" width={140} height={35} priority />
            </div>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="#" className="hover:text-gray-300">Empresa</Link>
          <Link href="/buscador" className="hover:text-gray-300">Coches</Link>
          <Link href="/buscador" className="hover:text-gray-300">Ofertas</Link>
          <Link href="#" className="hover:text-gray-300">Contacto</Link>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-white/10">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 flex items-center gap-2 border border-white/20 px-3">
            <Globe className="h-5 w-5" />
            <span className="text-sm">EN</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 md:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <button className="hidden md:block p-2 rounded-full hover:bg-white/10">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
} 