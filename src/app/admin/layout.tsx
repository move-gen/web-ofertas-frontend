import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/config';

interface DecodedToken {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // La autenticación se maneja en el middleware, no necesitamos verificación duplicada aquí
  return <>{children}</>;
}
