import { StrapiAuthResponse, StrapiCredentials } from '@/utils/types';
import Cookies from 'js-cookie';

export async function login(
  credentials: StrapiCredentials
): Promise<StrapiAuthResponse> {
  try {
    const response = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || 'Failed to login. Please check your credentials.'
      );
    }

    const data: StrapiAuthResponse = await response.json();
    
    // Verificar que tenemos tanto el token como el usuario
    if (data.jwt && data.user) {
      // Establecer la cookie del cliente (mismo nombre que el servidor)
      Cookies.set('authToken', data.jwt, { 
        expires: 1/24, // 1 hora
        secure: process.env.NODE_ENV !== 'development', 
        sameSite: 'strict' 
      });
      
      // También establecer en localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Login failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login.');
  }
}

export function logout(): void {
  // Limpiar cookies
  Cookies.remove('authToken');
  
  // Limpiar localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

export function getToken(): string | undefined {
  // Intentar obtener de cookie primero, luego de localStorage
  return Cookies.get('authToken') || 
         (typeof window !== 'undefined' ? localStorage.getItem('authToken') || undefined : undefined);
}

export function getUser(): StrapiAuthResponse['user'] | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
