import { useState } from "react";
import { CARD, BORDER, TEAL } from "../lib/theme.js";
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
        style={{ background: TEAL, color: "#fff" }}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg font-bold"
        title="Precisa de ajuda?"
      >
        ?
      </button>
      {open && (
        <div style={{ background: CARD, borderColor: BORDER }} className="fixed bottom-20 right-4 z-40 border rounded-xl shadow-2xl w-[320px] max-w-[92vw] h-[420px] flex flex-col overflow-hidden">
          <div style={{ background: TEAL, color: "#fff" }} className="px-3 py-2 text-sm font-semibold flex items-center justify-between">
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
