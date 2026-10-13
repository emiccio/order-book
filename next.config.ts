import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // En dev, next no hashea los nombres de los chunks: si el service worker
  // los cachea, cambios de código quedan pisados por la versión vieja en
  // caché (botones que "no andan", pantallas sin estilos). Solo en prod.
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
