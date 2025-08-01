import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>{children}</main>
    </div>
  );
} 