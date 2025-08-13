import Header from "@/components/Header";

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