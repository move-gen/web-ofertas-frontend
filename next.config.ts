/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'fotos.inventario.pro',
                port: '',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;
