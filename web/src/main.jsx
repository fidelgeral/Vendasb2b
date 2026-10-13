import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PublicChatPage from "./PublicChatPage.jsx";
import "./index.css";

// Atualização automática da app: quando sai uma versão nova, o service worker
// (registerType "autoUpdate") instala-a e assume o controlo. Aqui recarregamos
// a página UMA vez quando isso acontece, para a loja passar logo a usar a versão
// nova sem ter de limpar a cache à mão. Na primeira visita (ainda sem SW a
// controlar) não recarregamos, para não haver um recarregamento desnecessário.
if ("serviceWorker" in navigator) {
  const jaControlado = !!navigator.serviceWorker.controller;
  let recarregando = false;
  // Quando um service worker novo assume o controlo, recarrega uma vez para
  // passar logo a usar a versão nova (não recarrega na primeira visita).
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!jaControlado || recarregando) return;
    recarregando = true;
    window.location.reload();
  });
  // Procura ativamente por versões novas: ao arrancar, a cada minuto, e sempre
  // que a app volta a ficar visível. Assim a atualização entra sozinha, sem o
  // utilizador ter de limpar a cache à mão.
  navigator.serviceWorker.ready
    .then((reg) => {
      const verificar = () => {
        reg.update().catch(() => {});
        // Se já houver uma versão nova em espera, ativa-a imediatamente.
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
      };
      verificar();
      setInterval(verificar, 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") verificar();
      });
    })
    .catch(() => {});
}

// Roteamento mínimo: /loja/<codigo> é a página pública de atendimento de um
// negócio (sem autenticação); tudo o resto é a aplicação normal.
const lojaMatch = window.location.pathname.match(/^\/loja\/([^/]+)\/?$/);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {lojaMatch ? <PublicChatPage slug={lojaMatch[1]} /> : <App />}
  </React.StrictMode>
);
