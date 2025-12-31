/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Evita que o build use muitos recursos simultaneamente no VPS
    cpus: 1,
    workerThreads: false,
  },
}

export default nextConfig
