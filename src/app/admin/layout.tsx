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

import Sidebar from '@/components/admin/Sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // La autenticación se maneja en el middleware; aquí solo componemos el layout visual del área admin
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
