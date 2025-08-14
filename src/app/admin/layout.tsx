import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

const secret = process.env.NEXTAUTH_SECRET || 'your-default-secret';

interface DecodedToken {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwt.verify(token, secret) as DecodedToken;
      if (decoded && decoded.role === 'ADMIN') {
        isAdmin = true;
      }
    } catch (error) {
      console.error('Admin layout token validation error:', error);
    }
  }

  if (!isAdmin) {
    redirect('/login');
  }

  return <>{children}</>;
}
