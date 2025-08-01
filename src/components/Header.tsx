"use client";
import { usePathname } from 'next/navigation';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, Search } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  // La barra azul se aplicará a todas las páginas que usen este Header.
  // La landing page usa un componente diferente (`HeaderLanding`), por lo que no se verá afectada.
  const isBlue = true;

  const navItems = [
    { name: "Empresa", link: "#" },
    { name: "Coches", link: "/offers" },
    { name: "Ofertas", link: "/offers" },
    { name: "Contacto", link: "#" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const CustomNavbarLogo = () => (
    <Link href="/" className="flex items-center space-x-2">
      <div className="flex items-center justify-center h-12">
        <Image src="/logo-200x50.png" alt="MiguelLeón Logo" width={140} height={35} priority />
      </div>
    </Link>
  );

  return (
    <header className={'relative'}>
      <Navbar isBlue={isBlue}>
        {/* Desktop Navigation */}
        <NavBody>
          <CustomNavbarLogo />
          <NavItems items={navItems} isBlue={isBlue} />
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200">
              <Search className="h-5 w-5 text-white" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 flex items-center gap-2 border border-white/20 px-3 transition-colors duration-200">
              <Globe className="h-5 w-5 text-white" />
              <span className="text-sm text-white">EN</span>
            </button>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <CustomNavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              isBlue={isBlue}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
               <button className="p-2 rounded-full hover:bg-black/10 transition-colors duration-200 flex items-center gap-2 border border-black/20 px-3">
                <Search className="h-5 w-5" /> <span className='text-black'>Buscar</span>
              </button>
              <button className="p-2 rounded-full hover:bg-black/10 transition-colors duration-200 flex items-center gap-2 border border-black/20 px-3">
                <Globe className="h-5 w-5" />
                <span className="text-sm text-black">EN</span>
              </button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </header>
  );
}