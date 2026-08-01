// Ruta de servidor: GET/POST del estado completo del tablero (compartido por todo el grupo).
// Usa Upstash Redis como base de datos (gratis, se conecta desde el
// Marketplace de integraciones de Vercel). Hace falta:
//   1. En el dashboard del proyecto en Vercel: Storage -> Marketplace Database
//      Providers -> Upstash -> Redis (o instalar la integración "Upstash" desde
//      https://vercel.com/marketplace)
//   2. Conectarlo a este proyecto. Eso agrega solas las variables de entorno
//      UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const BOARD_KEY = "juntadas-sub:board-data";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const data = await redis.get(BOARD_KEY);
      res.status(200).json(data ?? null);
    } catch (e) {
      res.status(500).json({ error: "No se pudo leer el tablero. Revisá la configuración de Upstash Redis." });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      let body = req.body;
      if (typeof body === "string") {
        body = JSON.parse(body);
      }
      await redis.set(BOARD_KEY, body);
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: "No se pudo guardar el tablero. Revisá la configuración de Upstash Redis." });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end("Method Not Allowed");
}
