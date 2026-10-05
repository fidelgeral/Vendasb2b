import { useState } from "react";
import { CARD, BORDER, GRADIENT } from "../lib/theme.js";
import ChatWidget from "./ChatWidget.jsx";

export default function HelpAssistant({ api }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const reply = await api.assistantChat(next);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Desculpe, não consegui responder agora (" + e.message + ")." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ background: GRADIENT, color: "#fff", boxShadow: "0 8px 24px rgba(124,58,237,0.45)" }}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
        title="Precisa de ajuda?"
      >
        ?
      </button>
      {open && (
        <div style={{ background: CARD, borderColor: BORDER }} className="fixed bottom-24 right-5 z-40 border rounded-2xl shadow-2xl w-[340px] max-w-[92vw] h-[440px] flex flex-col overflow-hidden">
          <div style={{ background: GRADIENT, color: "#fff" }} className="px-4 py-3 text-sm font-bold flex items-center justify-between">
            Assistente de ajuda
            <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100">
              ✕
            </button>
          </div>
          <ChatWidget
            messages={messages}
            onSend={send}
            loading={loading}
            placeholder="Como abro o caixa?"
            emptyHint="Pergunte-me como usar qualquer função do VENDASB2B."
          />
        </div>
      )}
    </>
  );
}
