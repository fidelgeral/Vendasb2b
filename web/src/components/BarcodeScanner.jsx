import { useEffect, useRef, useState } from "react";
import { CARD, BORDER, MUTED, BRICK } from "../lib/theme.js";

// Leitor de código de barras pela câmara. A biblioteca @zxing é carregada por
// import dinâmico (só quando se abre o leitor) para não pesar no arranque.
export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (result && !cancelled) {
            cancelled = true;
            if (controlsRef.current) controlsRef.current.stop();
            onDetected(result.getText());
          }
        });
        controlsRef.current = controls;
      } catch (e) {
        setError("Não foi possível aceder à câmara. Autorize a câmara no navegador e tente novamente.");
      }
    })();
    return () => {
      cancelled = true;
      if (controlsRef.current) controlsRef.current.stop();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-2xl p-3 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Apontar ao código de barras</div>
          <button onClick={onClose} style={{ color: MUTED }} className="text-sm">✕</button>
        </div>
        {error ? (
          <div className="text-xs p-3" style={{ color: BRICK }}>{error}</div>
        ) : (
          <video ref={videoRef} className="w-full rounded-xl bg-black" style={{ aspectRatio: "4/3" }} muted playsInline />
        )}
        <div className="text-xs mt-2 text-center" style={{ color: MUTED }}>
          Aproxime o código. É detectado automaticamente.
        </div>
      </div>
    </div>
  );
}
