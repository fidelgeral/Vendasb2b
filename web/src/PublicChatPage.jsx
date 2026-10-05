import { useEffect, useState } from "react";
import { BG, CARD, BORDER, INK, GRADIENT } from "./lib/theme.js";
import { BRAND_NAME, BRAND_TAGLINE } from "./lib/theme.js";
import { BRAND_LOGO } from "./lib/logo.js";
import { publicApi } from "./lib/api.js";
import ChatWidget from "./components/ChatWidget.jsx";

export default function PublicChatPage({ slug }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    publicApi
      .getInfo(slug)
      .then(setInfo)
      .catch((e) => setError(e.message));
  }, [slug]);

  const send = async (text) => {
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const reply = await publicApi.chat(slug, next);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Desculpe, não consegui responder agora (" + e.message + ")." }]);
    }
    setLoading(false);
  };

  if (error) {
    return (
      <div style={{ background: BG, color: INK }} className="min-h-screen flex items-center justify-center p-6 text-sm text-center">
        {error}
      </div>
    );
  }

  if (!info) {
    return (
      <div style={{ background: BG, color: INK }} className="min-h-screen flex items-center justify-center text-sm">
        A carregar…
      </div>
    );
  }

  return (
    <div style={{ background: GRADIENT, color: INK, fontFamily: "system-ui, sans-serif" }} className="min-h-screen flex items-center justify-center p-4">
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-3xl shadow-2xl w-full max-w-md h-[600px] max-h-[92vh] flex flex-col overflow-hidden">
        <div style={{ background: GRADIENT, color: "#fff" }} className="px-5 py-4">
          <div className="text-[10px] tracking-wide opacity-75">{BRAND_NAME} · {BRAND_TAGLINE}</div>
          <div className="text-xl font-extrabold">{info.business.name}</div>
          <div className="text-xs opacity-90 mt-0.5">Assistente virtual · responde na hora</div>
          {(info.business.endereco || info.business.contacto) && (
            <div className="text-xs opacity-80 mt-0.5">
              {[info.business.endereco, info.business.contacto].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        <ChatWidget
          messages={messages}
          onSend={send}
          loading={loading}
          placeholder="Escreva a sua pergunta…"
          emptyHint={`Pergunte sobre produtos, preços ou como contactar "${info.business.name}".`}
        />
        <div className="text-center py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}>
          <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 16 }} className="inline opacity-60" />
        </div>
      </div>
    </div>
  );
}
