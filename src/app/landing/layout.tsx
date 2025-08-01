import HeaderLanding from '@/components/HeaderLanding';
import TransitionProvider from '@/components/animations/TransitionProvider';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black text-white">
      <TransitionProvider>
        <HeaderLanding />
        <main className="flex-grow">{children}</main>
      </TransitionProvider>
    </div>
  );
} 