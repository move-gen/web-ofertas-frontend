"use client";
import { usePathname } from 'next/navigation';
import Header from './Header';
import HeaderLanding from './HeaderLanding';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Render HeaderLanding only on the homepage
  if (pathname === '/') {
    return <HeaderLanding />;
  }
  
  // Render the default Header on all other pages
  return <Header />;
}
