/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  // Configuração para produção
  env: {
    HOSTNAME: '0.0.0.0',
  },
}

export default nextConfig
