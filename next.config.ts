import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { hostname: 'res.cloudinary.com' },
            { hostname: 'cdn.cafecito.app' },
        ],
    },
};

export default nextConfig;
