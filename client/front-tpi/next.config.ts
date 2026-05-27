import type { NextConfig } from "next";
import path from "path";

// La URL del backend se centraliza en BACKEND_URL (.env.local) para que
// next.config.ts y las API Routes usen siempre el mismo valor.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4001";

const nextConfig: NextConfig = {
  // Fija la raíz de Turbopack al directorio de este proyecto para evitar
  // el warning de múltiples lockfiles en el monorepo.
  turbopack: {
    root: path.resolve(__dirname),
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
