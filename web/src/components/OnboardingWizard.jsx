import { useState } from "react";
import { TEAL, CARD, BORDER, MUTED, GRADIENT } from "../lib/theme.js";
import { CheckCircle2 } from "../lib/icons.jsx";

const STEPS = [
  { title: "Bem-vindo ao VENDASB2B!", desc: "O seu sistema de vendas completo. Vamos configurar o essencial em 3 passos rápidos." },
  { title: "1. Dados da empresa", desc: "Vá a Configurações → Empresa e preencha o nome, NUIT, endereço e logótipo. Estes dados aparecem nos recibos e cotações." },
  { title: "2. Adicione produtos", desc: "Vá a Produtos e adicione os seus artigos com nome, preço e stock. Pode importar em massa via Excel." },
  { title: "3. Configure o caixa", desc: "Vá a Configurações → Impressão para escolher o tamanho do papel e Contas para activar M-Pesa/e-Mola. Depois abra o caixa e comece a vender!" },
];

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div style={{ background: CARD, borderColor: BORDER, maxWidth: 480 }} className="border rounded-2xl p-6 w-full shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((_, i) => (
            <div key={i} style={{ background: i <= step ? TEAL : "#E2E8F0", height: 4 }} className="flex-1 rounded-full transition-colors" />
          ))}
        </div>
        <div className="text-xl font-bold mb-2">{s.title}</div>
        <div className="text-sm mb-6" style={{ color: MUTED }}>{s.desc}</div>
        <div className="flex justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} style={{ borderColor: BORDER }} className="border rounded-lg px-4 py-2 text-sm">Voltar</button>
          ) : <div />}
          {isLast ? (
            <button onClick={onComplete} style={{ background: GRADIENT, color: "#fff" }} className="rounded-lg px-5 py-2 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} /> Começar a usar
            </button>
          ) : (
            <button onClick={() => setStep(step + 1)} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-5 py-2 text-sm font-semibold">Próximo</button>
          )}
        </div>
      </div>
    </div>
  );
}
