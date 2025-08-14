import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/config';

interface DecodedToken {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function middleware(request: NextRequest) {
  // Solo proteger rutas admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      
      if (!decoded || decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Token válido, continuar
      return NextResponse.next();
      
    } catch {
      // Token inválido o expirado
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
