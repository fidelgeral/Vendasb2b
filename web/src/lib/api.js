const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "vendasb2b_token";
const SESSION_KEY = "vendasb2b_session";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
export function setSession(token, session) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError("Sem ligação ao servidor. Verifique a sua internet e tente novamente.", 0);
  }
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : null;
  if (!res.ok) {
    if (res.status === 401) clearSession();
    throw new ApiError((data && data.error) || `Erro (${res.status})`, res.status);
  }
  return data;
}

const get = (path) => request("GET", path);
const post = (path, body) => request("POST", path, body);
const patch = (path, body) => request("PATCH", path, body);
const put = (path, body) => request("PUT", path, body);
const del = (path) => request("DELETE", path);

export const auth = {
  superLogin: (email, password) => post("/api/super/login", { email, password }),
  businessLookup: (slug) => post("/api/auth/business-lookup", { slug }),
  login: (slug, email, password) => post("/api/auth/login", { slug, email, password }),
};

export const superApi = {
  listBusinesses: () => get("/api/super/businesses").then((d) => d.businesses),
  createBusiness: (payload) => post("/api/super/businesses", payload).then((d) => d.business),
  renameBusiness: (id, name) => patch(`/api/super/businesses/${id}`, { name }).then((d) => d.business),
  toggleActive: (id) => patch(`/api/super/businesses/${id}/toggle-active`).then((d) => d.business),
  deleteBusiness: (id) => del(`/api/super/businesses/${id}`),
};

// Cliente da API de um negócio — cada método devolve o "store" já actualizado.
export function businessApi(businessId) {
  const base = `/api/businesses/${businessId}`;
  const s = (p) => p.then((d) => d.store);
  return {
    getStore: () => get(`${base}/store`).then((d) => d.store),

    createProduct: (payload) => s(post(`${base}/products`, payload)),
    updateProduct: (id, payload) => s(patch(`${base}/products/${id}`, payload)),
    deleteProduct: (id) => s(del(`${base}/products/${id}`)),
    adjustStock: (id, delta) => s(post(`${base}/products/${id}/stock-adjust`, { delta })),
    addVariant: (id, label) => s(post(`${base}/products/${id}/variants`, { label })),
    adjustVariant: (id, variantId, delta) => s(post(`${base}/products/${id}/variants/${variantId}/adjust`, { delta })),
    addBatch: (id, qty, expiryDate) => s(post(`${base}/products/${id}/batches`, { qty, expiryDate })),
    bulkImportProducts: (rows) => post(`${base}/products/bulk-import`, { rows }),
    addCategory: (name) => s(post(`${base}/categories`, { name })),
    removeCategory: (name) => s(del(`${base}/categories/${encodeURIComponent(name)}`)),

    createClient: (payload) => s(post(`${base}/clients`, payload)),
    updateClient: (id, payload) => s(patch(`${base}/clients/${id}`, payload)),
    deleteClient: (id) => s(del(`${base}/clients/${id}`)),
    payDebt: (id, debtId) => s(post(`${base}/clients/${id}/pay-debt`, { debtId })),
    payPartial: (id, valor) => s(post(`${base}/clients/${id}/pay-partial`, { valor })),

    createSupplier: (payload) => s(post(`${base}/suppliers`, payload)),
    deleteSupplier: (id) => s(del(`${base}/suppliers/${id}`)),
    registerPurchase: (payload) => s(post(`${base}/purchases`, payload)),

    addTable: (label) => s(post(`${base}/tables`, { label })),
    renameTable: (id, label) => s(patch(`${base}/tables/${id}`, { label })),
    removeTable: (id) => s(del(`${base}/tables/${id}`)),
    openComanda: (tableId) => s(post(`${base}/tables/${tableId}/comanda/open`)),
    setComandaItems: (tableId, items) => s(put(`${base}/tables/${tableId}/comanda/items`, { items })),
    cancelComanda: (tableId) => s(del(`${base}/tables/${tableId}/comanda`)),

    createEmployee: (payload) => s(post(`${base}/employees`, payload)),
    updateEmployee: (id, payload) => s(patch(`${base}/employees/${id}`, payload)),
    deleteEmployee: (id) => s(del(`${base}/employees/${id}`)),
    toggleEmployeeActive: (id) => s(post(`${base}/employees/${id}/toggle-active`)),

    openShift: (openingCash) => s(post(`${base}/shifts/open`, { openingCash })),
    closeShift: (closingCash) => s(post(`${base}/shifts/close`, { closingCash })),
    registerQuebra: (payload) => s(post(`${base}/quebras`, payload)),
    registerMovimento: (payload) => s(post(`${base}/movimentos`, payload)),

    finalizeSale: (payload) => post(`${base}/sales`, payload),
    voidSale: (id, reason) => s(post(`${base}/sales/${id}/void`, { reason })),
    parkSale: (cart) => s(post(`${base}/parked`, { cart })),
    resumeSale: (id) => s(del(`${base}/parked/${id}`)),

    patchConfig: (payload) => s(patch(`${base}/config`, payload)),
  };
}

export { ApiError };
