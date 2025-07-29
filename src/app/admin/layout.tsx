import type { Metadata } from 'next';
import Sidebar from '@/components/admin/Sidebar'; // Import the new sidebar

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Admin tools for the website.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-end px-6">
          {/* Header content like user profile, notifications can go here */}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 