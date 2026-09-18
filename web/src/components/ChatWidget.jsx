import { useEffect, useRef, useState } from "react";
import { BORDER, MUTED, TEAL } from "../lib/theme.js";

// Painel de chat genérico (mensagens + input) — usado pelo assistente interno
// de ajuda e pela página pública de atendimento de cada loja.
export default function ChatWidget({ messages, onSend, loading, placeholder, emptyHint }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const send = () => {
    const t = text.trim();
    if (!t || loading) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 p-3">
        {messages.length === 0 && (
          <div className="text-xs text-center py-6" style={{ color: MUTED }}>
            {emptyHint}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              style={{ background: m.role === "user" ? TEAL : "#EFF3F1", color: m.role === "user" ? "#fff" : "#16241F" }}
              className="rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap"
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div style={{ background: "#EFF3F1", color: MUTED }} className="rounded-lg px-3 py-2 text-sm">
              A escrever…
            </div>
          </div>
        )}
      </div>
      <div style={{ borderTop: `1px solid ${BORDER}` }} className="p-2 flex gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={placeholder}
          style={{ borderColor: BORDER }}
          className="flex-1 border rounded px-2.5 py-2 text-sm"
        />
        <button onClick={send} disabled={loading || !text.trim()} style={{ background: TEAL, color: "#fff" }} className="rounded px-3 py-2 text-sm font-medium disabled:opacity-40">
          Enviar
        </button>
      </div>
    </div>
  );
}
