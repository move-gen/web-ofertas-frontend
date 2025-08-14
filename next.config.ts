/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Desactivar completamente la optimización de imágenes
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuración más permisiva para imágenes externas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [
      'blob.vercel-storage.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'fotos.inventario.pro',
    ],
  },
  // Configuración adicional para evitar problemas de imágenes
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
