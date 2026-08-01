// Ruta de servidor: genera la pregunta de trivia con la API de Claude.
// La API key vive SOLO acá (variable de entorno ANTHROPIC_API_KEY en Vercel),
// nunca en el código del navegador.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Falta configurar ANTHROPIC_API_KEY en las variables de entorno de Vercel." });
    return;
  }

  let targetDate = "hoy";
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (body && body.targetDate) targetDate = body.targetDate;
  } catch (e) {
    // si no vino body, seguimos con el valor por defecto
  }

  const prompt = `Generá UNA pregunta de trivia de fútbol (mezclando fútbol argentino e internacional, historia, records, jugadores, mundiales, clubes) para un grupo de amigos argentinos que sigue bastante el fútbol. Fecha de la juntada: ${targetDate}. Que tenga dificultad media-alta — pensada para gente que sabe bastante, con algún dato que no sea obvio o de memoria fácil — pero sin llegar a ser una pregunta de nicho imposible o de estadística oscurísima. Devolvé SOLO un JSON, sin texto extra, sin markdown, con este formato exacto:
{"question": "texto de la pregunta", "options": ["opción A", "opción B", "opción C", "opción D"], "correctIndex": 0}
"correctIndex" es el índice (0 a 3) de la opción correcta dentro de "options".`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: `Error de la API de Anthropic: ${errText}` });
      return;
    }

    const result = await response.json();
    const text = (result.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const parsed = JSON.parse(text);

    if (
      !parsed.question ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correctIndex !== "number" ||
      parsed.correctIndex < 0 ||
      parsed.correctIndex > 3
    ) {
      throw new Error("Formato inesperado de la IA");
    }

    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message || "Error generando la trivia" });
  }
}
