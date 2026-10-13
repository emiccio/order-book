import { Serwist, StaleWhileRevalidate } from "serwist";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// A propósito cachea solo archivos estáticos (JS, CSS, íconos, fuentes).
// Las navegaciones y los datos siempre van a la red: con Server Components,
// cachear la navegación mostraría pantallas con números viejos.
const staticAssetCaching: RuntimeCaching[] = [
  {
    matcher: ({ request }) =>
      ["style", "script", "worker", "font", "image"].includes(request.destination),
    handler: new StaleWhileRevalidate({ cacheName: "static-assets" }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: staticAssetCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
