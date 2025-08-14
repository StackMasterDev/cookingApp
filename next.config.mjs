/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['res.cloudinary.com'], // Cloudinary domain'ini buraya ekleyin
    },
};

export default nextConfig;