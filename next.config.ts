/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configuración simplificada para evitar problemas de optimización
    unoptimized: true, // Desactivar optimización automática
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
};

export default nextConfig;
