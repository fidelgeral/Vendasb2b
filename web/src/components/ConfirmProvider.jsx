import { createContext, useContext, useCallback, useState } from "react";
import { CARD, BORDER, MUTED, TEAL, BRICK, INK } from "../lib/theme.js";

// Confirmação global (uma "janelinha" bonita) usada em todo o sistema antes de
// Guardar ou Apagar. Uso: const confirmar = useConfirm(); ... if (await
// confirmar({ title, message, confirmLabel, danger })) { ...acção... }
const ConfirmCtx = createContext(() => Promise.resolve(true));
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirmar = useCallback(
    (opts) =>
      new Promise((resolve) => {
        const base = typeof opts === "string" ? { message: opts } : opts || {};
        setState({ title: "Confirmar", confirmLabel: "Confirmar", danger: false, ...base, resolve });
      }),
    []
  );

  const fechar = (val) =>
    setState((s) => {
      if (s) s.resolve(val);
      return null;
    });

  return (
    <ConfirmCtx.Provider value={confirmar}>
      {children}
      {state && (
        <div onClick={() => fechar(false)} className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} style={{ background: CARD, borderColor: BORDER }} className="border rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="text-base font-bold mb-1" style={{ color: INK }}>
              {state.title}
            </div>
            <div className="text-sm mb-4 whitespace-pre-wrap" style={{ color: MUTED }}>
              {state.message}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => fechar(false)} style={{ borderColor: BORDER, color: INK }} className="border rounded-lg px-4 py-2 text-sm font-medium">
                Cancelar
              </button>
              <button onClick={() => fechar(true)} style={{ background: state.danger ? BRICK : TEAL, color: "#fff" }} className="rounded-lg px-4 py-2 text-sm font-semibold">
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
