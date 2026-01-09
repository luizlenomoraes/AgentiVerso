/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Removido para compatibilidade com npm start no Coolify
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuração para produção
  env: {
    HOSTNAME: '0.0.0.0',
  },
}

export default nextConfig
