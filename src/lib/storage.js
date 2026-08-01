// Reemplazo de la API window.storage (propia del entorno de artifacts de Claude.ai)
// por almacenamiento real:
//   - shared = true  -> datos compartidos por todo el grupo, guardados en el
//                       backend (Vercel KV) a través de /api/board.
//   - shared = false -> datos personales de este dispositivo/navegador,
//                       guardados en localStorage.
//
// Mantiene la misma "forma" de respuesta que window.storage para no tener
// que tocar la lógica de la app: { key, value, shared } | null

async function getShared() {
  const res = await fetch("/api/board");
  if (!res.ok) return null;
  const data = await res.json();
  if (data === null || data === undefined) return null;
  return { key: "board-data", value: JSON.stringify(data), shared: true };
}

async function setShared(value) {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: value,
  });
  if (!res.ok) return null;
  return { key: "board-data", value, shared: true };
}

export const storage = {
  async get(key, shared) {
    if (shared) {
      return getShared();
    }
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return { key, value: raw, shared: false };
    } catch (e) {
      return null;
    }
  },

  async set(key, value, shared) {
    if (shared) {
      return setShared(value);
    }
    try {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    } catch (e) {
      return null;
    }
  },

  async delete(key, shared) {
    if (shared) {
      // No se usa borrado de datos compartidos en esta app.
      return null;
    }
    try {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    } catch (e) {
      return null;
    }
  },

  async list(prefix, shared) {
    // No se usa en esta app, se deja implementado por compatibilidad.
    if (shared) return { keys: [], prefix, shared: true };
    const keys = Object.keys(localStorage).filter((k) => !prefix || k.startsWith(prefix));
    return { keys, prefix, shared: false };
  },
};
