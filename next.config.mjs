/** @type {import('next').NextConfig} */
import nextRoutes from "nextjs-routes/config";
const withRoutes = nextRoutes();

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'encrypted-tbn0.gstatic.com',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'pdfobject.com',
            pathname: '/**',
          },
        ],
      },
};

export default withRoutes(nextConfig);