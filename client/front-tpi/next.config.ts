import type { NextConfig } from "next";
import path from "path";

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
        destination: "http://localhost:4001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
