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
    
    // Debug: log de cookies
    console.log('🔍 Middleware - Cookies encontradas:', request.cookies.getAll().map(c => c.name));
    console.log('🔍 Middleware - Token encontrado:', token ? 'SÍ' : 'NO');
    
    if (!token) {
      console.log('❌ Middleware - No hay token, redirigiendo a login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      console.log('✅ Middleware - Token válido:', { email: decoded.email, role: decoded.role });
      
      if (!decoded || decoded.role !== 'ADMIN') {
        console.log('❌ Middleware - Usuario no es admin, redirigiendo a login');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Token válido, continuar
      console.log('✅ Middleware - Acceso permitido a admin');
      return NextResponse.next();
      
    } catch (error) {
      // Token inválido o expirado
      console.log('❌ Middleware - Error verificando token:', error);
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
