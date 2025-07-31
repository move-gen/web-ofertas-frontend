import HeaderLanding from "@/components/HeaderLanding";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black text-white">
      <HeaderLanding />
      <main>{children}</main>
    </div>
  );
} 