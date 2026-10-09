// Fila de vendas offline (IndexedDB).
//
// Quando não há internet, a venda é guardada aqui e reenviada ao servidor
// assim que a ligação voltar. O servidor atribui o número real do documento
// no momento da sincronização, por isso nunca há números duplicados — o stock
// é de consistência eventual (corrigido quando o "store" é recarregado).

const DB_NAME = "vendasb2b-offline";
const DB_VERSION = 1;
const STORE = "pendingSales";

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponível"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "localId" });
        os.createIndex("businessId", "businessId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        let result;
        Promise.resolve(fn(store)).then((r) => (result = r));
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
  );
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function localSaleId() {
  return "off-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

// Guarda uma venda para sincronizar mais tarde. `record` = { businessId, payload, employeeName }.
export async function enqueueSale(record) {
  const entry = {
    localId: localSaleId(),
    businessId: record.businessId,
    payload: record.payload,
    employeeName: record.employeeName || "",
    createdAt: new Date().toISOString(),
  };
  try {
    await tx("readwrite", (store) => store.put(entry));
    return entry;
  } catch {
    return null; // sem IndexedDB: a venda não é guardada, mas a app não deve rebentar
  }
}

export async function listPending(businessId) {
  try {
    const all = await tx("readonly", (store) => reqToPromise(store.getAll()));
    const rows = all || [];
    const filtered = businessId ? rows.filter((r) => r.businessId === businessId) : rows;
    return filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

export async function countPending(businessId) {
  return (await listPending(businessId)).length;
}

export async function removePending(localId) {
  try {
    await tx("readwrite", (store) => store.delete(localId));
  } catch {
    /* ignora */
  }
}
