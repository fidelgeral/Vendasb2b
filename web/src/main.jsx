import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PublicChatPage from "./PublicChatPage.jsx";
import "./index.css";

// Roteamento mínimo: /loja/<codigo> é a página pública de atendimento de um
// negócio (sem autenticação); tudo o resto é a aplicação normal.
const lojaMatch = window.location.pathname.match(/^\/loja\/([^/]+)\/?$/);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {lojaMatch ? <PublicChatPage slug={lojaMatch[1]} /> : <App />}
  </React.StrictMode>
);
