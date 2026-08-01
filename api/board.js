// Ruta de servidor: GET/POST del estado completo del tablero (compartido por todo el grupo).
// Usa Upstash Redis como base de datos. Lee las variables que agrega la
// integración de Marketplace en Vercel (a veces con el nombre viejo
// KV_REST_API_URL / KV_REST_API_TOKEN, a veces con el nuevo
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) para no depender de
// cuál de los dos haya quedado cargado.

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
