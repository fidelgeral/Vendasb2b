import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "robots.txt"],
      manifest: {
        name: "VENDASB2B",
        short_name: "VENDASB2B",
        description: "Ponto de venda para o seu negócio",
        lang: "pt-MZ",
        theme_color: "#4F46E5",
        background_color: "#F4F6FB",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        // Faz precache do "shell" da app para ela abrir mesmo sem internet.
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/loja\//],
        runtimeCaching: [
          {
            // Última cópia do "store" fica em cache para a app abrir offline com
            // os últimos dados conhecidos (NetworkFirst: tenta a rede primeiro).
            urlPattern: ({ url }) => url.pathname.includes("/store"),
            handler: "NetworkFirst",
            options: {
              cacheName: "vendasb2b-store",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "vendasb2b-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: { port: 5173 },
});
