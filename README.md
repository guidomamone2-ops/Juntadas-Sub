# Juntadas Sub

Tablero de asistencia, foro y trivia semanal para el grupo. Hecho con React + Vite,
listo para publicar en Vercel.

## Qué necesitás antes de arrancar

Este proyecto usa dos cosas externas que **no vienen incluidas** (por seguridad, nunca
deben vivir en el código):

1. **Una API key de Anthropic** (para generar las preguntas de trivia con IA).
   Se consigue en https://console.anthropic.com/settings/keys
2. **Una base de datos Redis de Upstash**, conectada como integración de Vercel
   (gratis en su plan Free) donde se guarda el tablero compartido (asistencias,
   foro, trivia, etc.)

Sin esto, la app se abre pero no va a poder guardar ni leer datos reales.

## Instalación local

```bash
npm install
```

## Desarrollo local

Hay dos formas de correrlo:

### Opción A — solo la interfaz (rápido, sin backend)
```bash
npm run dev
```
Abre la app en `http://localhost:5173`. Anda bien para tocar estilos o textos,
pero **las rutas `/api/*` no van a funcionar** (Vite solo sirve el frontend),
así que no vas a poder guardar el tablero ni generar trivia en este modo.

### Opción B — todo completo, con backend (recomendado)
Instalá la CLI de Vercel una vez:
```bash
npm install -g vercel
```
Y corré:
```bash
vercel dev
```
Esto levanta el frontend **y** las funciones de `/api` juntas, tal cual va a
funcionar en producción. Te va a pedir loguearte con tu cuenta de Vercel la
primera vez y linkear el proyecto (podés crear uno nuevo ahí mismo).

Para que `vercel dev` tenga las variables de entorno, creá un archivo `.env`
en la raíz (mirá `.env.example`) o cargalas en el dashboard de Vercel y corré
`vercel env pull` para traerlas a tu máquina.

## Publicar en Vercel (paso a paso)

1. **Subí este proyecto a un repositorio de GitHub** (podés arrastrar la carpeta
   a github.com/new o usar `git init && git add . && git commit -m "primer commit"`
   y `git push`).

2. **Entrá a https://vercel.com**, iniciá sesión, y tocá "Add New... -> Project".
   Elegí el repo que acabás de subir. Vercel detecta Vite automáticamente,
   no hace falta tocar nada en "Build settings".

3. **Antes de darle a Deploy** (o después, en Settings -> Environment Variables),
   agregá:
   - `ANTHROPIC_API_KEY` = tu API key de Anthropic

4. **Conectá Upstash Redis**: en el dashboard del proyecto, andá a la pestaña
   **Storage -> Marketplace Database Providers -> Upstash -> Redis**. Seguí
   los pasos (podés crear una base nueva gratis desde ahí mismo) y conectala
   a este proyecto. Vercel agrega solas las variables `UPSTASH_REDIS_REST_URL`
   y `UPSTASH_REDIS_REST_TOKEN` — no hace falta que las copies a mano.

5. **Deploy.** Cuando termine, te da una URL tipo `juntadas-sub.vercel.app`.
   Ese es el link que compartís con el grupo.

6. La primera vez que alguien lo abra, va a pedir la configuración inicial
   (cargar el plantel y el PIN de admin) — eso arma el tablero por primera vez
   en el KV Store.

## Estructura del proyecto

```
juntadas-sub/
├── api/
│   ├── board.js       # GET/POST del tablero compartido (Upstash Redis)
│   └── trivia.js      # Genera la pregunta de trivia con la API de Claude
├── public/
│   └── favicon.svg
├── src/
│   ├── lib/
│   │   └── storage.js # Capa de almacenamiento: compartido (API) vs personal (localStorage)
│   ├── App.jsx         # Toda la lógica y la interfaz de la app
│   ├── main.jsx         # Punto de entrada de React
│   └── index.css        # Tailwind
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Cómo se guardan los datos

- **Datos compartidos por todo el grupo** (asistencia, foro, trivia, contraseñas
  de cada persona, PIN de admin): en Upstash Redis, a través de
  `/api/board`.
- **Datos personales de cada dispositivo** (con qué nombre estás logueado en
  ese celu/compu): en `localStorage` del navegador — nunca viajan al servidor.

## Advertencia de seguridad (léela)

Las contraseñas de cada persona y el PIN de admin se guardan **en texto plano**
dentro del tablero — es una traba simple para que no cualquiera edite o
comente en nombre de otro dentro del grupo de amigos, **no es un sistema de
seguridad real**. No lo uses para nada que necesite protección de verdad.

## Modelo de IA usado

La trivia se genera con `claude-sonnet-4-6` a través de la API de Anthropic.
Si querés cambiar el modelo, editá la constante en `api/trivia.js`.
