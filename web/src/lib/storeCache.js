// Cache local do "store" para arranque instantâneo.
//
// Guardamos o último estado conhecido do negócio no aparelho. Na próxima
// abertura, a app mostra-o de imediato (sem ecrã "a carregar") e vai buscar a
// versão fresca ao servidor em segundo plano — padrão "stale-while-revalidate".
//
// As fotos (base64) são removidas da cópia guardada: são o que mais pesa e
// fariam estourar o limite do localStorage. Aparecem assim que a versão fresca
// chega (um instante depois). Tudo é embrulhado em try/catch porque o
// localStorage pode estar indisponível (janela privada, bloqueado, cheio).

const KEY = (businessId) => `vendasb2b_store_${businessId}`;

function semFotos(store) {
  if (!store || !store.products) return store;
  return {
    ...store,
    products: store.products.map((p) => (p.foto ? { ...p, foto: null } : p)),
  };
}

export function loadCachedStore(businessId) {
  if (!businessId) return null;
  try {
    const raw = localStorage.getItem(KEY(businessId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedStore(businessId, store) {
  if (!businessId || !store) return;
  try {
    localStorage.setItem(KEY(businessId), JSON.stringify(semFotos(store)));
  } catch {
    // Sem espaço ou indisponível: apaga o que houver para não ficar inconsistente.
    try {
      localStorage.removeItem(KEY(businessId));
    } catch {
      /* ignora */
    }
  }
}
