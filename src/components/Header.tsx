"use client";
import Link from 'next/link';
import { Search, Globe, Menu } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/landing';
  
  return (
    <header className={`${isLandingPage ? 'absolute top-0 left-0 right-0 z-50 text-white' : 'bg-[#0f286a] text-white shadow-lg'} p-6`}>
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center h-12">
                <Image src="/logo-200x50.png" alt="MiguelLeón Logo" width={140} height={35} priority />
            </div>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="#" className={`hover:${isLandingPage ? 'text-gray-300' : 'text-blue-200'} transition-colors duration-200`}>Empresa</Link>
          <Link href="/offers" className={`hover:${isLandingPage ? 'text-gray-300' : 'text-blue-200'} transition-colors duration-200`}>Coches</Link>
          <Link href="/offers" className={`hover:${isLandingPage ? 'text-gray-300' : 'text-blue-200'} transition-colors duration-200`}>Ofertas</Link>
          <Link href="#" className={`hover:${isLandingPage ? 'text-gray-300' : 'text-blue-200'} transition-colors duration-200`}>Contacto</Link>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button className={`p-2 rounded-full hover:bg-white/10 transition-colors duration-200`}>
            <Search className="h-5 w-5" />
          </button>
          <button className={`p-2 rounded-full hover:bg-white/10 flex items-center gap-2 border border-white/20 px-3 transition-colors duration-200`}>
            <Globe className="h-5 w-5" />
            <span className="text-sm">EN</span>
          </button>
          <button className={`p-2 rounded-full hover:bg-white/10 md:hidden transition-colors duration-200`}>
            <Menu className="h-6 w-6" />
          </button>
          <button className={`hidden md:block p-2 rounded-full hover:bg-white/10 transition-colors duration-200`}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
} 