import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "robots.txt"],
      // Activa o service worker também em "npm run dev", para se poder testar a
      // instalação como app e o cache offline sem esperar pelo deploy.
      devOptions: { enabled: true, type: "module" },
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
        // Importante: NÃO interceptamos a API aqui. O service worker só trata do
        // "shell" da app (HTML/JS/CSS, mesma origem). Os pedidos à API (store,
        // vendas, etc.) passam sempre direto à rede — cacheá-los cross-origin era
        // frágil e podia impedir o carregamento online. O offline das vendas é
        // garantido pela fila em IndexedDB, não pelo cache do SW.
        runtimeCaching: [
          {
            // Apenas as fontes do Google (padrão seguro e recomendado).
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
