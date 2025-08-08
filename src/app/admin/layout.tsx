import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decode } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get('authToken')?.value;

  let isAdmin = false;

  if (token) {
    try {
      const decoded = await decode({ token, secret });
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
