/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
