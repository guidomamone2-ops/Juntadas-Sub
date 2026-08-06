import React, { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "./lib/storage";
import {
  Flame,
  Crown,
  Check,
  X,
  Lock,
  Unlock,
  Plus,
  Settings,
  Trophy,
  MessageCircle,
  Pencil,
  Award,
  Trash2,
  MessagesSquare,
  Send,
  RefreshCw,
  Sparkles,
  HelpCircle,
  UserX,
  Menu,
  Package,
  Lightbulb,
  Sun,
  Quote,
  BarChart3,
  Star,
  Mail,
} from "lucide-react";

const STORAGE_KEY = "board-data";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
.font-display { font-family: 'Oswald', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
`;

// Historico importado del Excel "Comidas_Jueves.xlsx" (10 jueves, 28/05/2026 - 30/07/2026).
// Las ausencias historicas se cargan como "con aviso" (notified: true) por decision del usuario,
// ya que el excel original no distinguia aviso/sin aviso.

const FAQ_ITEMS = [
  {
    q: "¿Cómo se carga la asistencia?",
    a: "Solo el admin marca si viniste, si faltaste, y si fuiste anfitrión — así nadie puede \"hacerse trampa\" a sí mismo. Cada jueves se carga tocando la celda de cada persona, que va rotando entre: ausente sin aviso → ausente con aviso → presente → presente + anfitrión.",
  },
  {
    q: '¿Qué es "avisó" vs "sin aviso"?',
    a: "Refleja si esa persona avisó en el grupo de WhatsApp (en la votación semanal) que no iba a venir. Es distinto de la excusa — acá solo importa si avisó o no, no el motivo.",
  },
  {
    q: "¿Qué es el índice de Confiabilidad?",
    a: "Es el % de tus faltas que fueron avisadas (no el % de asistencia). Si faltaste 4 veces y avisaste en 3, tu confiabilidad es 75%. Si nunca faltaste, no hay nada que medir todavía y aparece como \"—\". Mide qué tan serio sos cuando no podés venir, no cuánto venís.",
  },
  {
    q: "¿Cómo cargo mi propia excusa?",
    a: "Primero elegís tu nombre arriba y creás tu contraseña (una sola vez; el dispositivo la recuerda después). Con la sesión iniciada, tocás el lápiz en tu propia celda de cualquier jueves y escribís el motivo — es opcional, nadie te obliga a poner nada.",
  },
  {
    q: "¿Para qué sirve la solapa de Temas?",
    a: 'Es donde se proponen los temas de charla para la próxima semanal — una lista colaborativa, sin votación. Cada uno puede proponer hasta 2 temas, no es obligatorio. Se ve quién propuso cada uno, y cada uno puede editar o borrar solo lo suyo. Cuando el admin carga la juntada siguiente, esa ronda queda archivada (de solo lectura) y arranca una nueva para la próxima.',
  },
  {
    q: "¿Cómo funciona la Trivia?",
    a: 'Sale una pregunta de un banco fijo cada vez que el admin agrega una juntada — una por juntada, la misma para todos. Tenés que iniciar sesión para jugar. Al entrar ves un botón "Comenzar" — recién ahí aparece la pregunta y tenés 10 segundos para elegir una opción, así no da tiempo a buscarla. Acertar suma un punto al ranking de Trivia.',
  },
  {
    q: "¿Mi contraseña es segura?",
    a: "No es un sistema de seguridad bancario — es solo una traba para que no cualquiera comente o cargue excusas en nombre de otro dentro del grupo.",
  },
  {
    q: "¿Qué es el Container?",
    a: "Es un espacio de reflexión, no un castigo de verdad. Después de cada juntada, cualquiera puede votar en anónimo a quién le vendría bien un momento aparte para repensar cómo viene jugando — entran los 2 más votados (o más si hay empate). También se vota si alguien ya se ganó salir. El admin puede liberar a alguien cuando quiera, aparte de la votación.",
  },
];

// Banco fijo de preguntas de trivia (cargadas a mano, no generadas por IA).
const TRIVIA_BANK = [
  {
    question: "¿Qué jugador disputó más finales de Champions League sin haberla ganado nunca?",
    options: ["Michael Ballack", "Gianluigi Buffon", "Pavel Nedvěd", "Antoine Griezmann"],
    correctIndex: 1,
  },
  {
    question: "¿Cuál fue el último club no europeo en ganar la Copa Intercontinental?",
    options: ["Boca Juniors", "São Paulo", "Corinthians", "Internacional"],
    correctIndex: 2,
  },
  {
    question: "¿Quién fue el último argentino en ganar el Balón de Oro antes de Lionel Messi?",
    options: ["Diego Maradona", "Mario Kempes", "Omar Sívori", "Alfredo Di Stéfano"],
    correctIndex: 2,
  },
  {
    question: "¿Qué selección eliminó a Argentina en el Mundial 2002?",
    options: ["Inglaterra", "Suecia", "Nigeria", "Ninguna de las anteriores"],
    correctIndex: 3,
  },
  {
    question: "¿Cuál de estos clubes nunca jugó una final de la Champions League?",
    options: ["Villarreal", "Valencia", "Bayer Leverkusen", "Arsenal"],
    correctIndex: 0,
  },
  {
    question: "¿Quién fue el goleador de la Copa Libertadores 2018?",
    options: ["Darío Benedetto", "Rafael Santos Borré", "Miguel Borja", "Wilson Morelo"],
    correctIndex: 3,
  },
  {
    question: "¿Qué jugador ganó más Champions League?",
    options: ["Cristiano Ronaldo", "Paolo Maldini", "Paco Gento", "Dani Carvajal"],
    correctIndex: 2,
  },
  {
    question: "¿Qué selección ganó un Mundial habiendo perdido el partido inaugural?",
    options: ["Italia", "España", "Argentina", "Francia"],
    correctIndex: 2,
  },
  {
    question: "¿Quién convirtió el primer gol del Mundial de Qatar 2022?",
    options: ["Lionel Messi", "Enner Valencia", "Bukayo Saka", "Cody Gakpo"],
    correctIndex: 1,
  },
  {
    question: "¿Qué club eliminó al Barcelona del histórico 8-2 en Lisboa?",
    options: ["Bayern Múnich", "PSG", "Liverpool", "Manchester City"],
    correctIndex: 0,
  },
  {
    question: "¿Qué arquero ganó el Balón de Oro de un Mundial?",
    options: ["Oliver Kahn", "Gianluigi Buffon", "Iker Casillas", "Manuel Neuer"],
    correctIndex: 0,
  },
  {
    question: "¿Cuál de estos jugadores nunca compartió equipo con Cristiano Ronaldo?",
    options: ["Luka Modrić", "Ángel Di María", "Kaká", "Andrés Iniesta"],
    correctIndex: 3,
  },
  {
    question: "¿Qué país perdió dos finales consecutivas de la Copa América contra el mismo rival?",
    options: ["Brasil", "Paraguay", "Argentina", "Uruguay"],
    correctIndex: 2,
  },
  {
    question: "¿Cuál fue el primer campeón invicto de la Champions League en el siglo XXI?",
    options: ["Barcelona 2006", "Manchester United 2008", "Inter 2010", "Bayern 2013"],
    correctIndex: 1,
  },
  {
    question: "¿Quién fue el máximo goleador de la Champions League 2011-12?",
    options: ["Cristiano Ronaldo", "Lionel Messi", "Mario Gómez", "Karim Benzema"],
    correctIndex: 1,
  },
];

const HISTORICAL_SEED = {
  "friends": [
    "Tato",
    "Turko",
    "Lombriz",
    "Mais",
    "Orti",
    "Tano",
    "Lulu",
    "Panti",
    "Pipe",
    "Bachicha",
    "MCP",
    "Mauve"
  ],
  "weeks": {
    "2026-05-28": {
      "Tato": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Orti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Tano": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Lulu": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Panti": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Pipe": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mauve": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      }
    },
    "2026-06-04": {
      "Tato": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Orti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Tano": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Lulu": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Panti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Pipe": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mauve": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      }
    },
    "2026-06-11": {
      "Tato": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Orti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Tano": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lulu": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Panti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Pipe": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mauve": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      }
    },
    "2026-06-18": {
      "Tato": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Orti": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Tano": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lulu": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Panti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Pipe": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mauve": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      }
    },
    "2026-06-25": {
      "Tato": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Orti": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Tano": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lulu": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Panti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Pipe": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mauve": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      }
    },
    "2026-07-02": {
      "Tato": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Orti": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Tano": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lulu": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Panti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Pipe": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Mauve": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      }
    },
    "2026-07-09": {
      "Tato": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Orti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Tano": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lulu": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Panti": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Pipe": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Mauve": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      }
    },
    "2026-07-16": {
      "Tato": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Orti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Tano": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lulu": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Panti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Pipe": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mauve": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      }
    },
    "2026-07-23": {
      "Tato": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "Lombriz": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mais": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Orti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Tano": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Lulu": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Panti": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Pipe": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Mauve": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      }
    },
    "2026-07-30": {
      "Tato": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Turko": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lombriz": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Mais": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Orti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Tano": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Lulu": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      },
      "Panti": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Pipe": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Bachicha": {
        "attended": true,
        "host": true,
        "notified": false,
        "reason": ""
      },
      "MCP": {
        "attended": true,
        "host": false,
        "notified": false,
        "reason": ""
      },
      "Mauve": {
        "attended": false,
        "host": false,
        "notified": true,
        "reason": ""
      }
    }
  },
  "guests": [
    "Saeta",
    "Roe",
    "Real"
  ],
  "guestLog": [
    {
      "date": "2026-07-02",
      "guest": "Roe"
    },
    {
      "date": "2026-07-09",
      "guest": "Roe"
    },
    {
      "date": "2026-07-02",
      "guest": "Real"
    },
    {
      "date": "2026-07-09",
      "guest": "Real"
    }
  ]
};

const HISTORICAL_WEEKEND_SEED = {
  "weekends": {
    "2026-07-11": {
      "plan": "Arrancamos con raviolada en los Fran Mauve, viendo champa, luego los pumas y cerramos con Noruega vs Inglaterra. Avanzamos con el día y a eso de las 19/20hs nos fuimos a lo de Lulu, donde Pipe el Carnes prendió el fuego y nos deleitó con un asombroso asado, en el medio hubo sanguches de miga, picada y muchas papas fritas (que se comió Sapito). Siguiendo las cabalas, Martín R nos designó los lugares de cada uno, y Victoria Quade nos agasajó con más papas, empanadas y tabletas de Freddo. Vimos el partido, la albiceleste se impuso 3-1, y terminamos la jornada entre risas.",
      "attendance": {
        "Tato": true,
        "Turko": true,
        "Lombriz": true,
        "Mais": true,
        "Orti": false,
        "Tano": true,
        "Lulu": false,
        "Panti": true,
        "Pipe": true,
        "Bachicha": true,
        "MCP": false,
        "Mauve": true
      }
    },
    "2026-07-18": {
      "plan": "Nos juntamos a alentar a la selección en una paupérrima final del mundo — hubo llantos, enojos, risas previas al partido, muchas emociones juntas. El resultado no fue el esperado pero nos juntamos igual, como en el 2022. El bonus track del año: Agus (Maimon) se desnudó en pleno partido y se sentó así en el sillón de Lulu (a Lulu no le gustó nada).",
      "attendance": {
        "Tato": true,
        "Turko": false,
        "Lombriz": true,
        "Mais": true,
        "Orti": true,
        "Tano": true,
        "Lulu": true,
        "Panti": true,
        "Pipe": true,
        "Bachicha": true,
        "MCP": true,
        "Mauve": true
      }
    },
    "2026-07-25": {
      "plan": "Anelkita disputó un amistoso interno con Mas, Según Villa y la banda — se lo lleva Anelkita pero el rival los hizo sufrir. Después fuimos al buffet de San Carlos Club, con atención y entrega de comida bastante tardías, platos variados (el plato del día lo llevan MCP y el Búfalo Vidiri: entraña con verduras asadas y mucha papa). Seguimos en lo de Marquitos Trica, charlando, tomando mates y viendo cómo cagaron a palos a Edul. Nos retiramos de la residencia Tricarico como a las 17:30 (la banda riverplatense se fue al Monumental), y los que quedaron se fueron a Buena Vista a jugar al PlayStation en parejas — victoria fantástica de Gero Arias, héroe del grupo. El plan cambió sobre la marcha (como todo lo que organizan el Turkito Gettas y Lulu el Panza Ramos): terminaron cenando en lo de MG, ahí se emborracharon, bailaron, y como a las 5am se fueron a comer una McFernández antes de dormir. Así se cerró un fin de semana a pura joda.",
      "attendance": {
        "Tato": true,
        "Turko": true,
        "Lombriz": true,
        "Mais": false,
        "Orti": true,
        "Tano": false,
        "Lulu": true,
        "Panti": true,
        "Pipe": true,
        "Bachicha": true,
        "MCP": true,
        "Mauve": true
      }
    },
    "2026-08-01": {
      "plan": "Los chicos iban a jugar al fútbol, pero se canceló — igual, algunos guerreros decidieron juntarse pese a las dificultades. La juntada arranca con unos mates en San Carlos con Felipe agasajándonos con sus ladridos de siempre. Después la banda se dirigió al market de San Carlos a comprar carne, y se prendió el fuego. Los chicos comieron asado, el Tanito se fue porque corría la carrera, y ahí terminó todo.",
      "attendance": {
        "Tato": false,
        "Turko": false,
        "Lombriz": true,
        "Mais": false,
        "Orti": true,
        "Tano": true,
        "Lulu": false,
        "Panti": false,
        "Pipe": false,
        "Bachicha": true,
        "MCP": false,
        "Mauve": true
      }
    }
  }
};


function emptyCell() {
  return { attended: false, host: false, notified: false, reason: "" };
}

function emptyWeekRow(friends) {
  const row = {};
  friends.forEach((f) => {
    row[f] = emptyCell();
  });
  return row;
}

function normalizeCell(cell) {
  if (!cell) return emptyCell();
  return {
    attended: !!cell.attended,
    host: !!cell.host,
    notified: !!cell.notified,
    reason: cell.reason || "",
  };
}

// Cycle order: ausente sin aviso -> ausente con aviso -> presente -> presente+anfitrion -> loop
function cycleCell(cell) {
  const c = normalizeCell(cell);
  let next;
  if (!c.attended && !c.notified) {
    next = { attended: false, host: false, notified: true };
  } else if (!c.attended && c.notified) {
    next = { attended: true, host: false, notified: false };
  } else if (c.attended && !c.host) {
    next = { attended: true, host: true, notified: false };
  } else {
    next = { attended: false, host: false, notified: false };
  }
  return { ...next, reason: c.reason };
}

function normalizeData(d) {
  if (!d) return d;
  return {
    ...d,
    guests: Array.isArray(d.guests) ? d.guests : [],
    guestLog: Array.isArray(d.guestLog) ? d.guestLog : [],
    comments: d.comments && typeof d.comments === "object" ? d.comments : {},
    topics: d.topics && typeof d.topics === "object" ? d.topics : {},
    weekends: d.weekends && typeof d.weekends === "object" ? d.weekends : {},
    quoteOfWeek:
      d.quoteOfWeek && typeof d.quoteOfWeek === "object"
        ? { text: d.quoteOfWeek.text || "", author: d.quoteOfWeek.author || "" }
        : { text: "", author: "" },
    friendAuth: d.friendAuth && typeof d.friendAuth === "object" ? d.friendAuth : {},
    trivia: d.trivia && typeof d.trivia === "object" ? d.trivia : {},
    calendar: d.calendar && typeof d.calendar === "object" ? d.calendar : {},
    contactMessages: Array.isArray(d.contactMessages) ? d.contactMessages : [],
    container:
      d.container && typeof d.container === "object"
        ? {
            members: Array.isArray(d.container.members) ? d.container.members : [],
            since: d.container.since && typeof d.container.since === "object" ? d.container.since : {},
            history: Array.isArray(d.container.history) ? d.container.history : [],
            votes: d.container.votes && typeof d.container.votes === "object" ? d.container.votes : {},
          }
        : { members: [], since: {}, history: [], votes: {} },
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Podium({ items, unit = "" }) {
  if (items.length === 0) return null;
  // Agrupa por valor (los empatados comparten el mismo puesto) y toma los primeros 3 puestos distintos
  const groups = [];
  items.forEach((item) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.value === item.value) {
      lastGroup.names.push(item.name);
    } else {
      groups.push({ value: item.value, names: [item.name] });
    }
  });
  const top3 = groups.slice(0, 3);
  const order = [1, 0, 2].filter((i) => i < top3.length);
  const heightClass = { 0: "h-24", 1: "h-16", 2: "h-10" };
  const medal = { 0: "🥇", 1: "🥈", 2: "🥉" };
  const borderClass = { 0: "border-amber-500", 1: "border-stone-400", 2: "border-orange-800" };
  return (
    <div className="flex items-end justify-center gap-2">
      {order.map((idx) => {
        const group = top3[idx];
        if (!group) return <div key={idx} className="flex-1 max-w-[110px]" />;
        return (
          <div key={idx} className="flex flex-col items-center flex-1 max-w-[110px]">
            <div className="text-2xl mb-1">{medal[idx]}</div>
            <div className="text-stone-50 text-xs font-medium text-center mb-1 leading-tight">
              {group.names.map((n) => (
                <div key={n} className="truncate w-full">
                  {n}
                </div>
              ))}
            </div>
            <div
              className={`w-full ${heightClass[idx]} bg-gradient-to-t from-stone-700 to-stone-600 rounded-t-lg flex items-start justify-center pt-1.5 border-t-2 ${borderClass[idx]}`}
            >
              <span className="text-orange-400 font-mono text-xs font-semibold">
                {group.value}
                {unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BarRow({ label, value, max, color, displayValue }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-stone-300">{label}</span>
        <span className="text-stone-400 font-mono">{displayValue !== undefined ? displayValue : value}</span>
      </div>
      <div className="w-full bg-stone-900 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AttendanceLineChart({ points, labels, maxY }) {
  const n = points.length;
  if (n === 0) return null;
  const stepX = n > 1 ? 100 / (n - 1) : 0;
  const coords = points.map((v, i) => {
    const x = n > 1 ? i * stepX : 50;
    const y = maxY > 0 ? 38 - (v / maxY) * 34 : 38;
    return { x, y, v };
  });
  const polyPoints = coords.map((c) => `${c.x},${c.y}`).join(" ");

  // Elige hasta 3 indices de referencia, bien distribuidos (primero, medio, ultimo)
  let labelIdxs = [];
  if (labels) {
    if (n <= 3) {
      labelIdxs = labels.map((_, i) => i);
    } else {
      labelIdxs = [...new Set([0, Math.round((n - 1) / 2), n - 1])];
    }
  }

  return (
    <div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-28">
        <polyline points={polyPoints} fill="none" stroke="#ea580c" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="1.4" fill="#fb923c" />
        ))}
      </svg>
      {labels && (
        <div className="relative h-4 mt-1">
          {labelIdxs.map((i) => (
            <span
              key={i}
              className="absolute text-stone-600 text-[10px] font-mono whitespace-nowrap"
              style={{
                left: `${coords[i].x}%`,
                transform: i === 0 ? "translateX(0)" : i === n - 1 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {labels[i]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getLatestDate(weeksObj) {
  const dates = Object.keys(weeksObj || {});
  if (dates.length === 0) return null;
  return dates.sort((a, b) => (a < b ? 1 : -1))[0];
}

// Cuenta los votos de entrada/salida al Container de una juntada ya concluida
// y devuelve el objeto container actualizado. No borra los votos (quedan
// como historial interno), pero nunca se muestra quien voto que a nadie.
function tallyContainer(juntadaDate, baseData) {
  const votes = (baseData.container.votes && baseData.container.votes[juntadaDate]) || {
    entry: {},
    exit: {},
  };
  const currentMembers = baseData.container.members;

  // ENTRADA: 2 mas votados, o mas si hay empate en el 2do puesto
  // Cada votante puede marcar mas de un nombre; cada marca suma un voto para ese nombre.
  const entryCounts = {};
  Object.values(votes.entry || {}).forEach((candidates) => {
    (candidates || []).forEach((candidate) => {
      entryCounts[candidate] = (entryCounts[candidate] || 0) + 1;
    });
  });
  const uniqueEntryCounts = [...new Set(Object.values(entryCounts))].sort((a, b) => b - a);
  let entrants = [];
  for (const cnt of uniqueEntryCounts) {
    const namesAtCount = Object.keys(entryCounts).filter((n) => entryCounts[n] === cnt);
    entrants.push(...namesAtCount);
    if (entrants.length >= 2) break;
  }
  entrants = entrants.filter((n) => !currentMembers.includes(n));

  // SALIDA: el/los mas votados para salir, siempre que superen a los votos de "que sigan"
  // (un votante que no marca a nadie esta votando implicitamente "que sigan").
  const exitCounts = {};
  let stayCount = 0;
  Object.values(votes.exit || {}).forEach((choices) => {
    if (!choices || choices.length === 0) {
      stayCount += 1;
      return;
    }
    choices.forEach((choice) => {
      exitCounts[choice] = (exitCounts[choice] || 0) + 1;
    });
  });
  const maxExitVotes = Object.keys(exitCounts).length ? Math.max(...Object.values(exitCounts)) : 0;
  let releasedNames = [];
  if (maxExitVotes > 0 && maxExitVotes >= stayCount) {
    releasedNames = Object.keys(exitCounts).filter((n) => exitCounts[n] === maxExitVotes);
  }

  const nextMembers = [...currentMembers.filter((n) => !releasedNames.includes(n)), ...entrants];
  const nextSince = { ...baseData.container.since };
  entrants.forEach((n) => {
    nextSince[n] = juntadaDate;
  });
  releasedNames.forEach((n) => {
    delete nextSince[n];
  });

  const nextHistory = [...baseData.container.history];
  releasedNames.forEach((n) => {
    nextHistory.push({
      name: n,
      dateIn: baseData.container.since[n] || juntadaDate,
      dateOut: juntadaDate,
    });
  });

  return {
    ...baseData.container,
    members: nextMembers,
    since: nextSince,
    history: nextHistory,
  };
}

function formatDateShort(iso) {
  const d = new Date(iso + "T12:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) +
    " · " +
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function JuntadasSub() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [setupNames, setSetupNames] = useState("");
  const [setupPin, setSetupPin] = useState("");

  const [newDate, setNewDate] = useState(todayISO());
  const [showAddWeek, setShowAddWeek] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [renameTarget, setRenameTarget] = useState("");
  const [renameValue, setRenameValue] = useState("");

  const [reasonModal, setReasonModal] = useState(null);
  const [deleteConfirmDate, setDeleteConfirmDate] = useState(null);
  const [deleteTriviaConfirm, setDeleteTriviaConfirm] = useState(null);

  const [guestName, setGuestName] = useState("");
  const [guestDate, setGuestDate] = useState(todayISO());
  const [importMsg, setImportMsg] = useState("");

  // Login personal (no persiste entre recargas, hay que entrar cada vez, como el admin)
  const [myName, setMyName] = useState(null);
  const [loginSelect, setLoginSelect] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPasswordConfirm, setLoginPasswordConfirm] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("planilla");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entryVoteChoices, setEntryVoteChoices] = useState([]);
  const [showContainerResults, setShowContainerResults] = useState(false);
  const [exitVoteChoices, setExitVoteChoices] = useState([]);
  const [welcomeDismissed, setWelcomeDismissed] = useState(true);
  const [welcomeChecked, setWelcomeChecked] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [topicDraft, setTopicDraft] = useState("");
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingTopicText, setEditingTopicText] = useState("");
  const [topicsRoundIndex, setTopicsRoundIndex] = useState(0);
  const [newWeekendDate, setNewWeekendDate] = useState(todayISO());
  const [showAddWeekend, setShowAddWeekend] = useState(false);
  const [deleteWeekendConfirm, setDeleteWeekendConfirm] = useState(null);
  const [editingPlanDate, setEditingPlanDate] = useState(null);
  const [editingQuote, setEditingQuote] = useState(false);
  const [quoteTextDraft, setQuoteTextDraft] = useState("");
  const [quoteAuthorDraft, setQuoteAuthorDraft] = useState("");
  const [devMessageDraft, setDevMessageDraft] = useState("");
  const [suggestionDraft, setSuggestionDraft] = useState("");
  const [devMessageSent, setDevMessageSent] = useState(false);
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [editingPlanText, setEditingPlanText] = useState("");

  const [triviaLoading, setTriviaLoading] = useState(false);
  const [triviaError, setTriviaError] = useState("");
  const [triviaStarted, setTriviaStarted] = useState(false);
  const [triviaSecondsLeft, setTriviaSecondsLeft] = useState(10);
  const triviaTimerRef = useRef(null);


  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await storage.get(STORAGE_KEY, true);
      if (result && result.value) {
        setData(normalizeData(JSON.parse(result.value)));
      } else {
        setData(null);
      }
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const result = await storage.get("welcome-seen", false);
        setWelcomeDismissed(!!(result && result.value));
      } catch (e) {
        setWelcomeDismissed(false);
      } finally {
        setWelcomeChecked(true);
      }
    })();
  }, []);

  const dismissWelcome = async () => {
    setWelcomeDismissed(true);
    try {
      await storage.set("welcome-seen", "1", false);
    } catch (e) {
      // si falla el guardado, igual queda ocultado para esta sesion
    }
  };

  const resetLoginForm = () => {
    setLoginSelect("");
    setLoginPassword("");
    setLoginPasswordConfirm("");
    setLoginError("");
  };

  const saveLocalAuth = async (name, password) => {
    try {
      await storage.set("my-auth", JSON.stringify({ name, password }), false);
    } catch (e) {
      // si falla, igual queda logueado para esta sesion
    }
  };

  const submitLogin = () => {
    if (!loginSelect) {
      setLoginError("Elegí tu nombre.");
      return;
    }
    const existingPassword = data.friendAuth[loginSelect];
    if (existingPassword) {
      if (loginPassword === existingPassword) {
        setMyName(loginSelect);
        saveLocalAuth(loginSelect, loginPassword);
        resetLoginForm();
      } else {
        setLoginError("Contraseña incorrecta.");
      }
    } else {
      if (loginPassword.trim().length < 3) {
        setLoginError("La contraseña debe tener al menos 3 caracteres.");
        return;
      }
      if (loginPassword !== loginPasswordConfirm) {
        setLoginError("Las contraseñas no coinciden.");
        return;
      }
      persist({ ...data, friendAuth: { ...data.friendAuth, [loginSelect]: loginPassword } });
      setMyName(loginSelect);
      saveLocalAuth(loginSelect, loginPassword);
      dismissWelcome();
      resetLoginForm();
    }
  };

  const logout = () => {
    setMyName(null);
    resetLoginForm();
    (async () => {
      try {
        await storage.delete("my-auth", false);
      } catch (e) {
        // no habia nada guardado, no pasa nada
      }
    })();
  };

  const [triedAutoLogin, setTriedAutoLogin] = useState(false);

  useEffect(() => {
    if (!data || myName || triedAutoLogin) return;
    setTriedAutoLogin(true);
    (async () => {
      try {
        const result = await storage.get("my-auth", false);
        if (result && result.value) {
          const saved = JSON.parse(result.value);
          if (saved && saved.name && data.friendAuth[saved.name] === saved.password) {
            setMyName(saved.name);
          }
        }
      } catch (e) {
        // no habia sesion guardada, no pasa nada
      }
    })();
  }, [data, myName, triedAutoLogin]);

  useEffect(() => {
    if (data && myName && !data.friends.includes(myName) && !data.guests.includes(myName)) {
      logout();
    }
  }, [data, myName]);

  const persist = async (next) => {
    setData(next);
    try {
      const result = await storage.set(STORAGE_KEY, JSON.stringify(next), true);
      if (!result) {
        setError("No se pudo guardar el cambio. Probá de nuevo.");
      }
    } catch (e) {
      setError("Error al guardar. Probá de nuevo.");
    }
  };

  const handleSetup = () => {
    const friends = setupNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (friends.length === 0 || !setupPin.trim()) return;
    persist({
      friends,
      pin: setupPin.trim(),
      weeks: {},
      guests: [],
      guestLog: [],
      comments: {},
      topics: {},
      weekends: {},
      quoteOfWeek: { text: "El IMAX es para los boludos", author: "el cinéfilo Costa Paz" },
      friendAuth: {},
      trivia: {},
      calendar: {},
      contactMessages: [],
      container: { members: [], since: {}, history: [], votes: {} },
    });
  };

  const handlePinSubmit = () => {
    if (pinInput === data.pin) {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("PIN incorrecto");
    }
  };

  const addWeek = () => {
    if (!newDate || data.weeks[newDate]) return;
    const previousLatest = getLatestDate(data.weeks);
    const nextContainer =
      previousLatest && data.container.votes[previousLatest]
        ? tallyContainer(previousLatest, data)
        : data.container;
    const next = {
      ...data,
      weeks: { ...data.weeks, [newDate]: emptyWeekRow(data.friends) },
      container: nextContainer,
    };
    persist(next);
    setShowAddWeek(false);
    generateTriviaForDate(newDate, next);
  };

  const deleteWeek = (date) => {
    if (!isAdmin) return;
    setDeleteConfirmDate(date);
  };

  const confirmDeleteWeek = () => {
    if (!deleteConfirmDate) return;
    const nextWeeks = { ...data.weeks };
    delete nextWeeks[deleteConfirmDate];
    persist({ ...data, weeks: nextWeeks });
    setDeleteConfirmDate(null);
  };

  const addComment = (date) => {
    const text = (commentDrafts[date] || "").trim();
    if (!text || !myName) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: myName,
      text,
      ts: Date.now(),
    };
    const existing = data.comments[date] || [];
    persist({
      ...data,
      comments: { ...data.comments, [date]: [...existing, entry] },
    });
    setCommentDrafts({ ...commentDrafts, [date]: "" });
  };

  const addTopic = (round) => {
    const openRound = getLatestDate(data.weeks);
    if (!myName || round !== openRound) return;
    const text = (topicDraft || "").trim();
    if (!text) return;
    const existing = data.topics[round] || [];
    const mine = existing.filter((t) => t.author === myName);
    if (mine.length >= 2) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: myName,
      text: text.slice(0, 120),
      ts: Date.now(),
    };
    persist({
      ...data,
      topics: { ...data.topics, [round]: [...existing, entry] },
    });
    setTopicDraft("");
  };

  const deleteTopic = (round, id) => {
    const openRound = getLatestDate(data.weeks);
    if (round !== openRound) return;
    const existing = data.topics[round] || [];
    const target = existing.find((t) => t.id === id);
    if (!target || target.author !== myName) return;
    persist({
      ...data,
      topics: { ...data.topics, [round]: existing.filter((t) => t.id !== id) },
    });
  };

  const saveTopicEdit = (round, id, newText) => {
    const openRound = getLatestDate(data.weeks);
    if (round !== openRound) return;
    const clean = (newText || "").trim();
    if (!clean) return;
    const existing = data.topics[round] || [];
    const target = existing.find((t) => t.id === id);
    if (!target || target.author !== myName) return;
    persist({
      ...data,
      topics: {
        ...data.topics,
        [round]: existing.map((t) => (t.id === id ? { ...t, text: clean.slice(0, 120) } : t)),
      },
    });
    setEditingTopicId(null);
  };

  const generateTriviaForDate = (targetDate, baseData, forceRandom = false) => {
    setTriviaLoading(true);
    setTriviaError("");
    try {
      let picked;
      if (forceRandom) {
        const currentQuestionText = baseData.trivia[targetDate] ? baseData.trivia[targetDate].question : null;
        const candidates = TRIVIA_BANK.filter((q) => q.question !== currentQuestionText);
        const pool = candidates.length > 0 ? candidates : TRIVIA_BANK;
        picked = pool[Math.floor(Math.random() * pool.length)];
      } else {
        const allDatesAsc = Object.keys(baseData.weeks).sort();
        let idx = allDatesAsc.indexOf(targetDate);
        if (idx === -1) idx = allDatesAsc.length;
        picked = TRIVIA_BANK[idx % TRIVIA_BANK.length];
      }
      persist({
        ...baseData,
        trivia: {
          ...baseData.trivia,
          [targetDate]: {
            question: picked.question,
            options: picked.options,
            correctIndex: picked.correctIndex,
            generatedAt: Date.now(),
            answers: {},
          },
        },
      });
    } catch (e) {
      setTriviaError("No se pudo cargar la trivia de esta juntada. Probá de nuevo.");
    } finally {
      setTriviaLoading(false);
    }
  };

  const answerTrivia = (selectedIndex) => {
    if (!myName) return;
    const latest = getLatestDate(data.weeks);
    if (!latest) return;
    const q = data.trivia[latest];
    if (!q || q.answers[myName]) return;
    const correct = selectedIndex === q.correctIndex;
    persist({
      ...data,
      trivia: {
        ...data.trivia,
        [latest]: {
          ...q,
          answers: { ...q.answers, [myName]: { selectedIndex, correct, ts: Date.now() } },
        },
      },
    });
  };

  const deleteTrivia = (date) => {
    if (!isAdmin) return;
    const nextTrivia = { ...data.trivia };
    delete nextTrivia[date];
    persist({ ...data, trivia: nextTrivia });
  };

  const castEntryVote = (candidatesArray) => {
    if (!myName || !data.friends.includes(myName)) return;
    const latest = getLatestDate(data.weeks);
    if (!latest) return;
    const roundVotes = data.container.votes[latest] || { entry: {}, exit: {} };
    if (roundVotes.entry && roundVotes.entry[myName] !== undefined) return; // ya voto esta ronda
    persist({
      ...data,
      container: {
        ...data.container,
        votes: {
          ...data.container.votes,
          [latest]: {
            entry: { ...(roundVotes.entry || {}), [myName]: candidatesArray },
            exit: roundVotes.exit || {},
          },
        },
      },
    });
    setEntryVoteChoices([]);
  };

  const castExitVote = (namesArray) => {
    if (!myName || !data.friends.includes(myName)) return;
    const latest = getLatestDate(data.weeks);
    if (!latest) return;
    const roundVotes = data.container.votes[latest] || { entry: {}, exit: {} };
    if (roundVotes.exit && roundVotes.exit[myName] !== undefined) return; // ya voto esta ronda
    persist({
      ...data,
      container: {
        ...data.container,
        votes: {
          ...data.container.votes,
          [latest]: {
            entry: roundVotes.entry || {},
            exit: { ...(roundVotes.exit || {}), [myName]: namesArray },
          },
        },
      },
    });
    setExitVoteChoices([]);
  };

  const releaseFromContainer = (name) => {
    if (!isAdmin) return;
    const nextMembers = data.container.members.filter((n) => n !== name);
    const nextSince = { ...data.container.since };
    const dateIn = nextSince[name] || todayISO();
    delete nextSince[name];
    persist({
      ...data,
      container: {
        ...data.container,
        members: nextMembers,
        since: nextSince,
        history: [...data.container.history, { name, dateIn, dateOut: todayISO() }],
      },
    });
  };

  const clearTriviaTimer = () => {
    if (triviaTimerRef.current) {
      clearInterval(triviaTimerRef.current);
      triviaTimerRef.current = null;
    }
  };

  const startTriviaTimer = () => {
    clearTriviaTimer();
    setTriviaStarted(true);
    setTriviaSecondsLeft(10);
    triviaTimerRef.current = setInterval(() => {
      setTriviaSecondsLeft((s) => {
        if (s <= 1) {
          clearTriviaTimer();
          answerTrivia(-1); // se acabó el tiempo, cuenta como sin respuesta
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const answerTriviaAndStop = (i) => {
    clearTriviaTimer();
    answerTrivia(i);
  };

  useEffect(() => {
    if (activeTab !== "trivia") {
      clearTriviaTimer();
      setTriviaStarted(false);
      setTriviaSecondsLeft(10);
    }
  }, [activeTab]);

  useEffect(() => () => clearTriviaTimer(), []);

  const latestTriviaGeneratedAt =
    data && data.trivia && getLatestDate(data.weeks) && data.trivia[getLatestDate(data.weeks)]
      ? data.trivia[getLatestDate(data.weeks)].generatedAt
      : null;

  useEffect(() => {
    clearTriviaTimer();
    setTriviaStarted(false);
    setTriviaSecondsLeft(10);
  }, [latestTriviaGeneratedAt]);

  const toggleCell = (date, friend) => {
    if (!isAdmin) return;
    const current = data.weeks[date][friend];
    const nextCell = cycleCell(current);
    const next = {
      ...data,
      weeks: {
        ...data.weeks,
        [date]: { ...data.weeks[date], [friend]: nextCell },
      },
    };
    persist(next);
  };

  const addFriend = () => {
    const name = newFriendName.trim();
    if (!name || data.friends.includes(name)) return;
    const nextWeeks = {};
    Object.keys(data.weeks).forEach((d) => {
      nextWeeks[d] = { ...data.weeks[d], [name]: emptyCell() };
    });
    persist({ ...data, friends: [...data.friends, name], weeks: nextWeeks });
    setNewFriendName("");
  };

  const renameFriend = (oldName, newName) => {
    const clean = (newName || "").trim();
    if (!clean || clean === oldName) return;
    if (data.friends.includes(clean) || data.guests.includes(clean)) {
      setError(`Ya existe alguien llamado "${clean}" en el grupo.`);
      return;
    }

    const isGuest = !data.friends.includes(oldName) && data.guests.includes(oldName);

    const nextFriends = isGuest
      ? data.friends
      : data.friends.map((f) => (f === oldName ? clean : f));

    const nextGuests = isGuest
      ? data.guests.map((g) => (g === oldName ? clean : g))
      : data.guests;

    const nextGuestLog = data.guestLog.map((e) => (e.guest === oldName ? { ...e, guest: clean } : e));

    const nextWeeks = {};
    Object.entries(data.weeks).forEach(([d, row]) => {
      const nextRow = { ...row };
      if (oldName in nextRow) {
        nextRow[clean] = nextRow[oldName];
        delete nextRow[oldName];
      }
      nextWeeks[d] = nextRow;
    });

    const nextComments = {};
    Object.entries(data.comments).forEach(([d, list]) => {
      nextComments[d] = list.map((c) => (c.author === oldName ? { ...c, author: clean } : c));
    });

    const nextTopics = {};
    Object.entries(data.topics).forEach(([d, list]) => {
      nextTopics[d] = list.map((t) => (t.author === oldName ? { ...t, author: clean } : t));
    });

    const nextWeekends = {};
    Object.entries(data.weekends).forEach(([d, entry]) => {
      const nextAttendance = { ...entry.attendance };
      if (oldName in nextAttendance) {
        nextAttendance[clean] = nextAttendance[oldName];
        delete nextAttendance[oldName];
      }
      nextWeekends[d] = { ...entry, attendance: nextAttendance };
    });

    const nextContainerMembers = data.container.members.map((n) => (n === oldName ? clean : n));
    const nextContainerSince = { ...data.container.since };
    if (oldName in nextContainerSince) {
      nextContainerSince[clean] = nextContainerSince[oldName];
      delete nextContainerSince[oldName];
    }
    const nextContainerHistory = data.container.history.map((h) => (h.name === oldName ? { ...h, name: clean } : h));
    const nextContainerVotes = {};
    Object.entries(data.container.votes).forEach(([d, round]) => {
      const renameVoterMap = (obj) => {
        const next = {};
        Object.entries(obj || {}).forEach(([voter, choice]) => {
          const nextVoter = voter === oldName ? clean : voter;
          const nextChoice = Array.isArray(choice) ? choice.map((n) => (n === oldName ? clean : n)) : choice;
          next[nextVoter] = nextChoice;
        });
        return next;
      };
      nextContainerVotes[d] = {
        entry: renameVoterMap(round.entry),
        exit: renameVoterMap(round.exit),
      };
    });

    const nextContactMessages = data.contactMessages.map((m) => (m.author === oldName ? { ...m, author: clean } : m));

    const nextFriendAuth = { ...data.friendAuth };
    if (oldName in nextFriendAuth) {
      nextFriendAuth[clean] = nextFriendAuth[oldName];
      delete nextFriendAuth[oldName];
    }

    const nextTrivia = {};
    Object.entries(data.trivia).forEach(([d, q]) => {
      const nextAnswers = { ...q.answers };
      if (oldName in nextAnswers) {
        nextAnswers[clean] = nextAnswers[oldName];
        delete nextAnswers[oldName];
      }
      nextTrivia[d] = { ...q, answers: nextAnswers };
    });

    persist({
      ...data,
      friends: nextFriends,
      guests: nextGuests,
      guestLog: nextGuestLog,
      weeks: nextWeeks,
      comments: nextComments,
      topics: nextTopics,
      weekends: nextWeekends,
      contactMessages: nextContactMessages,
      container: {
        ...data.container,
        members: nextContainerMembers,
        since: nextContainerSince,
        history: nextContainerHistory,
        votes: nextContainerVotes,
      },
      friendAuth: nextFriendAuth,
      trivia: nextTrivia,
    });

    if (myName === oldName) {
      setMyName(clean);
    }
  };

  const missingHistoricalWeekends = data
    ? Object.keys(HISTORICAL_WEEKEND_SEED.weekends).filter((d) => !data.weekends[d])
    : [];

  const importHistoricalWeekends = () => {
    const mergedWeekends = { ...data.weekends };
    let added = 0;
    Object.entries(HISTORICAL_WEEKEND_SEED.weekends).forEach(([date, entry]) => {
      if (mergedWeekends[date]) return;
      const attendance = {};
      data.friends.forEach((f) => {
        attendance[f] = entry.attendance[f] !== undefined ? entry.attendance[f] : false;
      });
      mergedWeekends[date] = { plan: entry.plan, attendance };
      added += 1;
    });
    persist({ ...data, weekends: mergedWeekends });
    setImportMsg(`Se importaron ${added} fin(es) de semana historicos.`);
  };

  const addWeekend = () => {
    if (!newWeekendDate || data.weekends[newWeekendDate]) return;
    const attendance = {};
    data.friends.forEach((f) => {
      attendance[f] = false;
    });
    persist({
      ...data,
      weekends: { ...data.weekends, [newWeekendDate]: { plan: "", attendance } },
    });
    setShowAddWeekend(false);
  };

  const deleteWeekend = (date) => {
    if (!isAdmin) return;
    setDeleteWeekendConfirm(date);
  };

  const confirmDeleteWeekend = () => {
    if (!deleteWeekendConfirm) return;
    const nextWeekends = { ...data.weekends };
    delete nextWeekends[deleteWeekendConfirm];
    persist({ ...data, weekends: nextWeekends });
    setDeleteWeekendConfirm(null);
  };

  const toggleWeekendAttendance = (date, friend) => {
    if (!isAdmin) return;
    const entry = data.weekends[date];
    const current = entry.attendance[friend] || false;
    persist({
      ...data,
      weekends: {
        ...data.weekends,
        [date]: { ...entry, attendance: { ...entry.attendance, [friend]: !current } },
      },
    });
  };

  const saveWeekendPlan = (date, plan) => {
    if (!isAdmin) return;
    const entry = data.weekends[date];
    persist({
      ...data,
      weekends: { ...data.weekends, [date]: { ...entry, plan } },
    });
  };

  const saveQuoteOfWeek = () => {
    if (!isAdmin) return;
    const text = quoteTextDraft.trim();
    const author = quoteAuthorDraft.trim();
    if (!text || !author) return;
    persist({ ...data, quoteOfWeek: { text, author } });
    setEditingQuote(false);
  };

  const addContactMessage = (type, text) => {
    const clean = (text || "").trim();
    if (!clean || !myName) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      author: myName,
      text: clean,
      ts: Date.now(),
    };
    persist({ ...data, contactMessages: [...data.contactMessages, entry] });
    if (type === "developer") {
      setDevMessageDraft("");
      setDevMessageSent(true);
    } else {
      setSuggestionDraft("");
      setSuggestionSent(true);
    }
  };

  const missingHistoricalWeeks = data
    ? Object.keys(HISTORICAL_SEED.weeks).filter((d) => !data.weeks[d])
    : [];

  const importHistorical = () => {
    // Asegura que los 12 titulares del historico esten en el plantel (agrega los que falten, al final)
    const mergedFriends = [...data.friends];
    HISTORICAL_SEED.friends.forEach((f) => {
      if (!mergedFriends.includes(f)) mergedFriends.push(f);
    });

    // Agrega las semanas historicas que todavia no existen (no pisa semanas ya cargadas)
    const mergedWeeks = { ...data.weeks };
    let addedWeeks = 0;
    Object.entries(HISTORICAL_SEED.weeks).forEach(([date, row]) => {
      if (mergedWeeks[date]) return;
      const fullRow = {};
      mergedFriends.forEach((f) => {
        fullRow[f] = row[f] ? row[f] : emptyCell();
      });
      mergedWeeks[date] = fullRow;
      addedWeeks += 1;
    });

    // Agrega los amigos del exterior y su historial, sin duplicar
    const mergedGuests = [...data.guests];
    HISTORICAL_SEED.guests.forEach((g) => {
      if (!mergedGuests.includes(g)) mergedGuests.push(g);
    });
    const existingKeys = new Set(data.guestLog.map((e) => `${e.date}|${e.guest}`));
    const mergedGuestLog = [...data.guestLog];
    HISTORICAL_SEED.guestLog.forEach((e) => {
      const key = `${e.date}|${e.guest}`;
      if (!existingKeys.has(key)) {
        mergedGuestLog.push(e);
        existingKeys.add(key);
      }
    });

    persist({
      ...data,
      friends: mergedFriends,
      weeks: mergedWeeks,
      guests: mergedGuests,
      guestLog: mergedGuestLog,
    });
    setImportMsg(`Se importaron ${addedWeeks} jueves historicos.`);
  };

  const addGuestEntry = () => {
    const name = guestName.trim();
    if (!name || !guestDate) return;
    const key = `${guestDate}|${name}`;
    const alreadyExists = data.guestLog.some((e) => `${e.date}|${e.guest}` === key);
    if (alreadyExists) return;
    const nextGuests = data.guests.includes(name) ? data.guests : [...data.guests, name];
    persist({
      ...data,
      guests: nextGuests,
      guestLog: [...data.guestLog, { date: guestDate, guest: name }],
    });
    setGuestName("");
  };

  const openCell = (date, friend) => {
    const cell = normalizeCell(data.weeks[date][friend]);
    const canEditReason = isAdmin || (myName && myName === friend);
    setReasonModal({
      date,
      friend,
      mode: canEditReason ? "edit" : "view",
      draft: cell.reason,
    });
  };

  const saveReason = () => {
    if (!reasonModal) return;
    const { date, friend, draft } = reasonModal;
    const current = normalizeCell(data.weeks[date][friend]);
    const next = {
      ...data,
      weeks: {
        ...data.weeks,
        [date]: { ...data.weeks[date], [friend]: { ...current, reason: draft.trim() } },
      },
    };
    persist(next);
    setReasonModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <style>{FONT_IMPORT}</style>
        <div className="text-stone-400 font-mono text-sm">Cargando planilla...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
        <style>{FONT_IMPORT}</style>
        <div className="w-full max-w-md bg-stone-800 border border-stone-700 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="text-orange-600" size={24} />
            <h1 className="font-display text-2xl font-semibold text-stone-50 tracking-wide uppercase">
              Juntadas Sub
            </h1>
          </div>
          <p className="text-stone-400 text-sm mb-6">
            Configuración inicial — cargá el plantel y definí el PIN de administrador.
          </p>

          <label className="block text-stone-300 text-xs font-mono uppercase tracking-wider mb-2">
            Nombres (separados por coma)
          </label>
          <textarea
            value={setupNames}
            onChange={(e) => setSetupNames(e.target.value)}
            placeholder="Juan, Pedro, Trini, Guido..."
            className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-600"
            rows={3}
          />

          <label className="block text-stone-300 text-xs font-mono uppercase tracking-wider mb-2">
            PIN de administrador
          </label>
          <input
            type="text"
            value={setupPin}
            onChange={(e) => setSetupPin(e.target.value)}
            placeholder="Ej: 4290"
            className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-orange-600"
          />

          <button
            onClick={handleSetup}
            className="w-full bg-orange-600 hover:bg-orange-500 text-stone-950 font-display font-semibold uppercase tracking-wide py-2.5 rounded transition-colors"
          >
            Crear planilla
          </button>
        </div>
      </div>
    );
  }

  if (!triedAutoLogin) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <style>{FONT_IMPORT}</style>
        <div className="text-stone-400 font-mono text-sm">Verificando sesión...</div>
      </div>
    );
  }

  if (!myName) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
        <style>{FONT_IMPORT}</style>
        <div className="w-full max-w-md bg-stone-800 border border-stone-700 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="text-orange-600" size={24} />
            <h1 className="font-display text-2xl font-semibold text-stone-50 tracking-wide uppercase">
              Juntadas Sub
            </h1>
          </div>

          {welcomeChecked && !welcomeDismissed && (
            <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 mb-5">
              <p className="text-stone-50 text-sm font-medium mb-2">¡Bienvenido a Juntadas Sub! 🔥</p>
              <p className="text-stone-400 text-sm mb-2">
                Acá vamos a ir dejando registrado quién vino y quién faltó a cada juntada semanal, quién fue
                anfitrión, y todo lo demás que se les cante sumar: temas para charlar, trivia, y lo que venga.
              </p>
              <p className="text-stone-400 text-sm">
                Para entrar: elegí tu nombre en la lista de abajo y creá tu propia contraseña — es la primera y
                única vez que la vas a tener que inventar, después el dispositivo te va a reconocer solo.
              </p>
            </div>
          )}

          <div className="text-stone-300 text-sm font-medium mb-3">¿Quién sos vos?</div>

          <div className="flex flex-wrap gap-2 mb-2">
            <select
              value={loginSelect}
              onChange={(e) => {
                setLoginSelect(e.target.value);
                setLoginPassword("");
                setLoginPasswordConfirm("");
                setLoginError("");
              }}
              className="bg-stone-900 border border-stone-700 rounded px-2 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              <option value="">Elegí tu nombre...</option>
              <optgroup label="Locales">
                {data.friends.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </optgroup>
              {data.guests.length > 0 && (
                <optgroup label="Del exterior">
                  {data.guests.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitLogin()}
              placeholder={loginSelect && !data.friendAuth[loginSelect] ? "Creá tu contraseña" : "Tu contraseña"}
              disabled={!loginSelect}
              className="flex-1 min-w-[140px] bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 disabled:opacity-50"
            />
          </div>

          {loginSelect && !data.friendAuth[loginSelect] && (
            <input
              type="password"
              value={loginPasswordConfirm}
              onChange={(e) => setLoginPasswordConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitLogin()}
              placeholder="Confirmá tu contraseña"
              className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          )}

          {loginError && <p className="text-rose-400 text-xs mb-2">{loginError}</p>}

          <button
            onClick={submitLogin}
            disabled={!loginSelect || !loginPassword}
            className="w-full bg-sky-700 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-stone-50 py-2.5 rounded font-display font-semibold uppercase text-sm"
          >
            {loginSelect && !data.friendAuth[loginSelect] ? "Crear y entrar" : "Entrar"}
          </button>

          <p className="text-stone-500 text-xs mt-3">
            Este dispositivo va a recordar tu sesión — no vas a tener que volver a poner la contraseña cada vez
            que entrés, solo si tocás "salir" o entrás desde otro celular/compu.
          </p>
        </div>
      </div>
    );
  }

  const friends = data.friends;
  const weekDates = Object.keys(data.weeks).sort((a, b) => (a < b ? 1 : -1));
  const weekDatesAsc = [...weekDates].sort((a, b) => (a < b ? -1 : 1));
  const totalWeeks = weekDates.length;

  const stats = friends
    .map((f) => {
      let present = 0;
      let host = 0;
      let absences = 0;
      let notifiedAbsences = 0;
      let streak = 0;
      let streakBroken = false;

      weekDates.forEach((d) => {
        const cell = normalizeCell(data.weeks[d][f]);
        if (cell.attended) present += 1;
        if (cell.host) host += 1;
        if (!cell.attended) {
          absences += 1;
          if (cell.notified) notifiedAbsences += 1;
        }
        if (!streakBroken) {
          if (cell.attended) streak += 1;
          else streakBroken = true;
        }
      });

      const pct = totalWeeks ? Math.round((present / totalWeeks) * 100) : 0;
      const confiabilidad = absences > 0 ? Math.round((notifiedAbsences / absences) * 100) : null;

      return { name: f, present, host, pct, confiabilidad, streak };
    })
    .sort((a, b) => b.pct - a.pct || b.present - a.present);

  const friendsByAttendance = stats.map((s) => s.name);

  let record = null;
  weekDatesAsc.forEach((d) => {
    const count = friends.filter((f) => normalizeCell(data.weeks[d][f]).attended).length;
    if (!record || count > record.count) {
      record = { date: d, count };
    }
  });

  return (
    <div className="min-h-screen bg-stone-900 pb-16">
      <style>{FONT_IMPORT}</style>

      <div className="border-b border-stone-800 px-5 py-5 flex items-center justify-between sticky top-0 bg-stone-900/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded hover:bg-stone-800 text-stone-300"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <Flame className="text-orange-600 flex-shrink-0" size={22} />
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-stone-50 tracking-wide uppercase">
            Juntadas Sub
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="p-2 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
              aria-label="Configuración"
            >
              <Settings size={18} />
            </button>
          )}
          <button
            onClick={() => (isAdmin ? setIsAdmin(false) : setShowPinModal(true))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono uppercase tracking-wide transition-colors ${
              isAdmin ? "bg-orange-600 text-stone-950" : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
            {isAdmin ? "Admin" : "Ver"}
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 max-w-[80%] bg-stone-900 border-r border-stone-700 h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-5 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Flame className="text-orange-600" size={20} />
                <span className="font-display font-semibold text-stone-50 uppercase tracking-wide text-sm">
                  Juntadas Sub
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-stone-800 text-stone-400"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 py-3">
              {[
                { key: "planilla", label: "Panel General", icon: <Flame size={16} /> },
                { key: "temas", label: "Temas", icon: <Lightbulb size={16} /> },
                { key: "findes", label: "Fin de Semana", icon: <Sun size={16} /> },
                { key: "estadisticas", label: "Estadísticas", icon: <BarChart3 size={16} /> },
                { key: "trivia", label: "Trivia", icon: <span className="text-base leading-none">⚽</span> },
                { key: "container", label: "Container", icon: <Package size={16} /> },
                { key: "contacto", label: "Contáctanos", icon: <Mail size={16} /> },
                { key: "faq", label: "FAQ", icon: <HelpCircle size={16} /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-mono uppercase tracking-wide transition-colors ${
                    activeTab === item.key
                      ? "bg-orange-600 text-stone-950 font-semibold"
                      : "text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-5 mt-4 bg-red-950 border border-red-800 text-red-200 text-sm rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="mx-5 mt-4 text-xs text-stone-500 flex items-center gap-2">
        <span>
          Sos <span className="text-stone-200 font-medium">{myName}</span>
        </span>
        <button onClick={logout} className="text-sky-500 hover:text-sky-400 underline">
          salir
        </button>
      </div>

      {data.container.members.length > 0 && (
        <div className="mx-5 mt-3 flex items-center gap-2 bg-rose-950/30 border border-rose-900 rounded-lg px-4 py-2.5 text-sm">
          <Package size={16} className="text-rose-400 flex-shrink-0" />
          <span className="text-stone-300">
            <span className="text-rose-300 font-semibold">En el Container:</span>{" "}
            <span className="text-stone-100">{data.container.members.join(", ")}</span>
          </span>
        </div>
      )}

      {activeTab === "planilla" && (
        <>
      <div className="px-5 mt-6">
        <button
          onClick={() => {
            setActiveTab("temas");
            setTopicsRoundIndex(0);
          }}
          className="w-full bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-orange-600 rounded-lg px-4 py-3 text-left transition-colors flex items-center gap-3"
        >
          <Lightbulb size={20} className="text-orange-500 flex-shrink-0" />
          <div>
            <div className="font-display font-semibold text-stone-50 text-sm uppercase tracking-wide">
              ¿De qué vamos a hablar la próxima semana?
            </div>
            <div className="text-stone-500 text-xs">Proponé los temas que quieras que se hablen en la próxima semanal.</div>
          </div>
        </button>
      </div>

      {isAdmin && showSettings && (
        <div className="mx-5 mt-4 bg-stone-800 border border-stone-700 rounded-lg p-4">
          <div className="text-stone-300 text-xs font-mono uppercase tracking-wider mb-2">
            Agregar amigo al plantel
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              placeholder="Nombre"
              className="flex-1 bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <button
              onClick={addFriend}
              className="bg-orange-600 hover:bg-orange-500 text-stone-950 px-4 rounded font-display font-semibold uppercase text-sm"
            >
              Sumar
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-700">
            <div className="text-stone-300 text-xs font-mono uppercase tracking-wider mb-2">
              Renombrar amigo (titular o del exterior)
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={renameTarget}
                onChange={(e) => setRenameTarget(e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded px-2 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="">Elegí a quién...</option>
                <optgroup label="Locales">
                  {data.friends.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </optgroup>
                {data.guests.length > 0 && (
                  <optgroup label="Del exterior">
                    {data.guests.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Nombre nuevo"
                className="flex-1 min-w-[120px] bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
              <button
                onClick={() => {
                  if (renameTarget && renameValue.trim()) {
                    renameFriend(renameTarget, renameValue.trim());
                    setRenameTarget("");
                    setRenameValue("");
                  }
                }}
                disabled={!renameTarget || !renameValue.trim()}
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 px-4 rounded font-display font-semibold uppercase text-sm"
              >
                Renombrar
              </button>
            </div>
            <p className="text-stone-500 text-xs mt-2">
              Cambia el nombre en el plantel, en toda la planilla histórica, los temas, los findes, el Container y
              la trivia.
            </p>
          </div>

          {missingHistoricalWeeks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-700">
              <div className="text-stone-300 text-xs font-mono uppercase tracking-wider mb-2">
                Historico del Excel ({missingHistoricalWeeks.length} jueves sin importar)
              </div>
              <button
                onClick={importHistorical}
                className="bg-sky-700 hover:bg-sky-600 text-stone-50 px-4 py-2 rounded font-display font-semibold uppercase text-sm"
              >
                Importar histórico
              </button>
              <p className="text-stone-500 text-xs mt-2">
                Trae los 10 jueves del Excel (28/05 al 30/07/2026), asegura que estén los 12 titulares y
                suma a Mexicano/London/Uru como amigos del exterior con su historial de apariciones.
              </p>
            </div>
          )}
          {importMsg && <p className="text-emerald-400 text-xs mt-2">{importMsg}</p>}
        </div>
      )}

      {record && record.count > 0 && (
        <div className="mx-5 mt-6 flex items-center gap-2 bg-stone-800/60 border border-stone-700 rounded-lg px-4 py-2.5 text-sm">
          <Award size={16} className="text-amber-500 flex-shrink-0" />
          <span className="text-stone-300">
            Récord del grupo: <span className="text-stone-50 font-semibold">{record.count}</span> presentes el{" "}
            <span className="text-stone-50 font-semibold">{formatDate(record.date)}</span>
          </span>
        </div>
      )}

      {weekDates.length > 0 && (
        <div className="mx-5 mt-3 bg-rose-950/30 border border-rose-900 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <UserX size={16} className="text-rose-400 flex-shrink-0" />
            <span className="text-rose-300 text-sm font-display font-semibold uppercase tracking-wide">
              Lista Negra
            </span>
          </div>
          {(() => {
            const lastDate = weekDates[0];
            const absentees = friends.filter((f) => !normalizeCell(data.weeks[lastDate][f]).attended);
            return absentees.length === 0 ? (
              <p className="text-stone-300 text-sm">Nadie faltó en la última juntada. 👏</p>
            ) : (
              <p className="text-stone-100 text-sm">{absentees.join(", ")}</p>
            );
          })()}
          <p className="text-stone-500 text-xs mt-1">Quiénes no vinieron a la última juntada.</p>
        </div>
      )}

      <div className="px-5 mt-6">
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy size={15} className="text-amber-500" />
          <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider">
            Tabla de posiciones
          </h2>
        </div>
        <div className="bg-stone-800 border border-stone-700 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="text-stone-400 text-xs font-mono uppercase border-b border-stone-700">
                <th className="text-left px-3 py-2 w-8">#</th>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-right px-3 py-2">Asist.</th>
                <th className="text-right px-3 py-2">%</th>
                <th className="text-right px-3 py-2">Anfit.</th>
                <th className="text-right px-3 py-2">Confiab.</th>
                <th className="text-right px-3 py-2">Racha</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const minPct = totalWeeks > 0 && stats.length > 0 ? Math.min(...stats.map((s) => s.pct)) : null;
                return stats.map((s, i) => {
                  const isLast = minPct !== null && s.pct === minPct;
                  return (
                    <tr
                      key={s.name}
                      className={`border-b border-stone-700/50 last:border-0 ${
                        isLast ? "bg-rose-950/40" : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-stone-500 font-mono">{i + 1}</td>
                      <td className={`px-3 py-2 font-medium ${isLast ? "text-rose-300" : "text-stone-50"}`}>
                        {s.name}
                      </td>
                      <td className={`px-3 py-2 text-right font-mono ${isLast ? "text-rose-300" : "text-stone-300"}`}>
                        {s.present}/{totalWeeks}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono font-semibold ${
                          isLast ? "text-rose-400" : "text-orange-500"
                        }`}
                      >
                        {s.pct}%
                      </td>
                      <td className="px-3 py-2 text-right text-amber-500 font-mono">
                        {s.host > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <Crown size={13} /> {s.host}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sky-500">
                        {s.confiabilidad === null ? "—" : `${s.confiabilidad}%`}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-stone-300">
                        {s.streak > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            {s.streak} <Flame size={12} className="text-orange-500" />
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
        <p className="text-stone-500 text-xs mt-2">
          Confiab. = % de las faltas que fueron avisadas. Racha = juntadas seguidas viniendo, contando desde la más reciente.
        </p>
      </div>

      <div className="px-5 mt-6">
        <div className="bg-stone-800 border border-amber-800/40 rounded-lg p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-amber-500 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Quote size={13} /> Frase de la semana
            </span>
            {isAdmin && !editingQuote && (
              <button
                onClick={() => {
                  setEditingQuote(true);
                  setQuoteTextDraft(data.quoteOfWeek.text);
                  setQuoteAuthorDraft(data.quoteOfWeek.author);
                }}
                className="text-stone-500 hover:text-orange-500 flex-shrink-0"
                aria-label="Editar frase"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>

          {editingQuote ? (
            <div className="space-y-2">
              <textarea
                value={quoteTextDraft}
                onChange={(e) => setQuoteTextDraft(e.target.value)}
                rows={2}
                placeholder="La frase..."
                className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1.5 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <input
                type="text"
                value={quoteAuthorDraft}
                onChange={(e) => setQuoteAuthorDraft(e.target.value)}
                placeholder="Quién la dijo..."
                className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1.5 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditingQuote(false)} className="text-xs text-stone-400 hover:text-stone-200">
                  Cancelar
                </button>
                <button
                  onClick={saveQuoteOfWeek}
                  disabled={!quoteTextDraft.trim() || !quoteAuthorDraft.trim()}
                  className="text-xs text-amber-500 hover:text-amber-400 font-semibold disabled:opacity-40"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : data.quoteOfWeek.text ? (
            <>
              <p className="text-stone-100 text-base italic leading-snug">"{data.quoteOfWeek.text}"</p>
              <p className="text-stone-500 text-sm mt-1">— {data.quoteOfWeek.author}</p>
            </>
          ) : (
            <p className="text-stone-600 text-sm italic">Todavía no hay frase cargada.</p>
          )}
        </div>
      </div>

      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider">
            Planilla semana a semana
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowAddWeek((s) => !s)}
              className="flex items-center gap-1 text-xs font-mono uppercase text-orange-500 hover:text-orange-400"
            >
              <Plus size={14} /> Juntada
            </button>
          )}
        </div>

        {isAdmin && showAddWeek && (
          <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 mb-4 flex gap-2 items-center">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <button
              onClick={addWeek}
              className="bg-orange-600 hover:bg-orange-500 text-stone-950 px-4 py-1.5 rounded font-display font-semibold uppercase text-sm"
            >
              Agregar
            </button>
          </div>
        )}

        {totalWeeks === 0 ? (
          <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-8 text-center text-stone-500 text-sm">
            Todavía no hay juntadas cargadas.
            {isAdmin ? ' Tocá "+ Juntada" para arrancar.' : ""}
          </div>
        ) : (
          <div className="bg-stone-800 border border-stone-700 rounded-lg overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="text-stone-400 text-xs font-mono uppercase border-b border-stone-700">
                  <th className="text-left px-3 py-2 sticky left-0 bg-stone-800">Fecha</th>
                  {friendsByAttendance.map((f) => (
                    <th key={f} className="text-center px-3 py-2 min-w-[64px]">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekDates.map((date) => (
                  <tr key={date} className="border-b border-stone-700/50 last:border-0">
                    <td className="px-3 py-2 text-stone-300 font-mono text-xs whitespace-nowrap sticky left-0 bg-stone-800">
                      <div className="flex items-center gap-1.5">
                        <span>{formatDate(date)}</span>
                        {isAdmin && (
                          <button
                            onClick={() => deleteWeek(date)}
                            className="text-stone-600 hover:text-rose-500"
                            aria-label={`Borrar ${formatDate(date)}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                    {friendsByAttendance.map((f) => {
                      const cell = normalizeCell(data.weeks[date][f]);
                      const hasReason = cell.reason && cell.reason.length > 0;
                      let bg = "bg-stone-700 text-stone-400";
                      let Icon = X;
                      if (cell.host) {
                        bg = "bg-amber-500 text-stone-950";
                        Icon = Crown;
                      } else if (cell.attended) {
                        bg = "bg-orange-600/90 text-stone-950";
                        Icon = Check;
                      } else if (cell.notified) {
                        bg = "bg-sky-600/80 text-stone-50";
                        Icon = MessageCircle;
                      } else {
                        bg = "bg-rose-700/70 text-stone-50";
                        Icon = X;
                      }
                      const isMine = !isAdmin && myName && myName === f;
                      return (
                        <td key={f} className="px-3 py-2 text-center">
                          <div className="relative inline-block">
                            <button
                              onClick={() => (isAdmin ? toggleCell(date, f) : openCell(date, f))}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${bg} hover:opacity-80 cursor-pointer`}
                              aria-label={`${f} - ${formatDate(date)}`}
                            >
                              <Icon size={14} />
                            </button>
                            {(isAdmin || isMine) && (
                              <button
                                onClick={() => openCell(date, f)}
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                                  hasReason ? "bg-stone-200 text-stone-900" : "bg-stone-900 text-stone-500"
                                } border border-stone-800`}
                                aria-label="Motivo"
                              >
                                <Pencil size={8} />
                              </button>
                            )}
                            {!isAdmin && !isMine && hasReason && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-stone-200 border border-stone-800" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-3 text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-orange-600/90 inline-block" /> Presente
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 inline-block" /> Anfitrión
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-sky-600/80 inline-block" /> Avisó que faltaba
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-rose-700/70 inline-block" /> Faltó sin avisar
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200 inline-block" /> Tiene motivo (tocá el lápiz)
          </div>
        </div>
      </div>

      {/* AMIGOS DEL EXTERIOR */}
      <div className="px-5 mt-8">
        <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-1">
          Amigos del exterior
        </h2>
        <p className="text-stone-500 text-xs mb-3">
          Viven afuera, así que no entran en la tabla de posiciones ni en las rachas — acá queda registrado
          cuándo se sumaron.
        </p>

        {data.guests.length === 0 ? (
          <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-6 text-center text-stone-500 text-sm">
            Todavía no hay nadie cargado acá.
          </div>
        ) : (
          <div className="bg-stone-800 border border-stone-700 rounded-lg p-4">
            <div className="flex flex-wrap gap-4 mb-3">
              {data.guests.map((g) => {
                const count = data.guestLog.filter((e) => e.guest === g).length;
                return (
                  <div key={g} className="text-sm">
                    <span className="text-stone-50 font-medium">{g}</span>{" "}
                    <span className="text-sky-500 font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
            {data.guestLog.length > 0 && (
              <div className="border-t border-stone-700 pt-3 space-y-1 max-h-48 overflow-y-auto">
                {[...data.guestLog]
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((e, i) => (
                    <div key={i} className="flex justify-between text-xs font-mono text-stone-400">
                      <span>{formatDate(e.date)}</span>
                      <span className="text-stone-200">{e.guest}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 mt-3 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nombre (ej: London)"
              list="guest-suggestions"
              className="flex-1 min-w-[140px] bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <datalist id="guest-suggestions">
              {data.guests.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
            <input
              type="date"
              value={guestDate}
              onChange={(e) => setGuestDate(e.target.value)}
              className="bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <button
              onClick={addGuestEntry}
              className="bg-sky-700 hover:bg-sky-600 text-stone-50 px-4 py-1.5 rounded font-display font-semibold uppercase text-sm"
            >
              Sumar
            </button>
          </div>
        )}
      </div>
        </>
      )}

      {activeTab === "temas" && (
        <div className="px-5 mt-6">
          <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Temas para la próxima semanal
          </h2>
          <p className="text-stone-500 text-xs mb-4">
            Lista colaborativa, sin votación. Hasta 2 temas por persona, no es obligatorio participar.
          </p>

          {weekDates.length === 0 ? (
            <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-8 text-center text-stone-500 text-sm">
              Todavía no hay juntadas cargadas — la ronda de temas arranca con la primera.
            </div>
          ) : (
            (() => {
              const openRound = weekDates[0];
              const maxIndex = weekDates.length - 1;
              const safeIndex = Math.min(topicsRoundIndex, maxIndex);
              const round = weekDates[safeIndex];
              const isOpen = round === openRound;
              const roundTopics = data.topics[round] || [];
              const myCount = myName ? roundTopics.filter((t) => t.author === myName).length : 0;

              return (
                <div className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-700 flex items-center justify-between">
                    <button
                      onClick={() => setTopicsRoundIndex((i) => Math.min(i + 1, maxIndex))}
                      disabled={safeIndex >= maxIndex}
                      className="text-stone-400 hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed px-1"
                      aria-label="Semanal anterior"
                    >
                      ‹
                    </button>
                    <div className="text-center">
                      <div className="font-display font-semibold text-stone-50 uppercase tracking-wide text-sm">
                        {isOpen ? "Próxima semanal" : `Semanal del ${formatDate(round)}`}
                      </div>
                      {isOpen && (
                        <div className="text-emerald-500 text-xs font-mono uppercase">Ronda abierta</div>
                      )}
                      {!isOpen && <div className="text-stone-500 text-xs font-mono uppercase">Archivada</div>}
                    </div>
                    <button
                      onClick={() => setTopicsRoundIndex((i) => Math.max(i - 1, 0))}
                      disabled={safeIndex <= 0}
                      className="text-stone-400 hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed px-1"
                      aria-label="Semanal siguiente"
                    >
                      ›
                    </button>
                  </div>

                  <div className="px-4 py-3 space-y-3 max-h-80 overflow-y-auto">
                    {roundTopics.length === 0 ? (
                      <p className="text-stone-500 text-xs italic">Todavía nadie propuso ningún tema acá.</p>
                    ) : (
                      roundTopics.map((t) => {
                        const isMine = isOpen && t.author === myName;
                        const isEditing = editingTopicId === t.id;
                        return (
                          <div key={t.id} className="flex items-start justify-between gap-2">
                            {isEditing ? (
                              <div className="flex-1 space-y-1.5">
                                <textarea
                                  value={editingTopicText}
                                  onChange={(e) => setEditingTopicText(e.target.value)}
                                  maxLength={120}
                                  rows={2}
                                  className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1.5 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingTopicId(null)}
                                    className="text-xs text-stone-400 hover:text-stone-200"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => saveTopicEdit(round, t.id, editingTopicText)}
                                    className="text-xs text-orange-500 hover:text-orange-400 font-semibold"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-stone-50 text-sm font-medium">{t.author}</span>
                                    <span className="text-stone-500 text-xs font-mono">{formatDateTime(t.ts)}</span>
                                  </div>
                                  <p className="text-stone-300 text-sm whitespace-pre-wrap">{t.text}</p>
                                </div>
                                {isMine && (
                                  <div className="flex gap-1.5 flex-shrink-0">
                                    <button
                                      onClick={() => {
                                        setEditingTopicId(t.id);
                                        setEditingTopicText(t.text);
                                      }}
                                      className="text-stone-500 hover:text-orange-500"
                                      aria-label="Editar tema"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      onClick={() => deleteTopic(round, t.id)}
                                      className="text-stone-500 hover:text-rose-500"
                                      aria-label="Borrar tema"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {isOpen && (
                    <div className="px-4 py-3 border-t border-stone-700">
                      {!myName ? (
                        <p className="text-stone-500 text-xs italic">Iniciá sesión arriba para proponer un tema.</p>
                      ) : myCount >= 2 ? (
                        <p className="text-stone-500 text-xs italic">Ya usaste tus 2 temas en esta ronda.</p>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={topicDraft}
                            onChange={(e) => setTopicDraft(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addTopic(round)}
                            maxLength={120}
                            placeholder="Proponé un tema para charlar..."
                            className="flex-1 bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                          />
                          <button
                            onClick={() => addTopic(round)}
                            disabled={!topicDraft.trim()}
                            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 px-3 rounded flex items-center justify-center"
                            aria-label="Proponer tema"
                          >
                            <Send size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {!isOpen && (
                    <div className="px-4 py-2 border-t border-stone-700">
                      <p className="text-stone-600 text-xs italic">Semanal archivada — de solo lectura.</p>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {activeTab === "trivia" && (
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider">
              Trivia de la juntada ⚽
            </h2>
            <span className="flex items-center gap-1 text-stone-500 text-xs font-mono">
              <Sparkles size={12} /> banco fijo de preguntas
            </span>
          </div>
          <p className="text-stone-500 text-xs mb-4">Una pregunta por juntada, un punto — la misma para todos.</p>

          {(() => {
            const latest = getLatestDate(data.weeks);

            if (!latest) {
              return (
                <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-8 text-center text-stone-400 text-sm mb-2">
                  Todavía no hay ninguna juntada cargada. La trivia se genera sola apenas el admin agregue la primera.
                </div>
              );
            }

            if (triviaLoading) {
              return (
                <div className="bg-stone-800 border border-stone-700 rounded-lg p-8 text-center text-stone-400 text-sm">
                  Pensando una pregunta difícil...
                </div>
              );
            }

            if (triviaError) {
              return (
                <div className="bg-stone-800 border border-rose-800 rounded-lg p-4 text-center">
                  <p className="text-rose-300 text-sm mb-3">{triviaError}</p>
                  {isAdmin ? (
                    <button
                      onClick={() => generateTriviaForDate(latest, data)}
                      className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-stone-950 px-4 py-2 rounded font-display font-semibold uppercase text-sm"
                    >
                      <RefreshCw size={14} /> Reintentar
                    </button>
                  ) : (
                    <p className="text-stone-500 text-xs">Avisale al admin para que la genere de nuevo.</p>
                  )}
                </div>
              );
            }

            const q = data.trivia[latest];

            if (!q) {
              return (
                <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-6 text-center text-stone-400 text-sm">
                  <p className="mb-3">Todavía no se generó la trivia de esta juntada ({formatDate(latest)}).</p>
                  {isAdmin ? (
                    <button
                      onClick={() => generateTriviaForDate(latest, data)}
                      className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-stone-950 px-4 py-2 rounded font-display font-semibold uppercase text-sm"
                    >
                      <RefreshCw size={14} /> Generar trivia
                    </button>
                  ) : (
                    <p className="text-stone-500 text-xs">Esperá a que el admin la genere.</p>
                  )}
                </div>
              );
            }

            const myAnswer = myName ? q.answers[myName] : null;
            const revealed = !!myAnswer;
            const canPlay = myName && !revealed;
            const showQuestion = !canPlay || triviaStarted;

            return (
              <div className="bg-stone-800 border border-stone-700 rounded-lg p-4">
                <p className="text-stone-500 text-xs font-mono mb-3">Juntada del {formatDate(latest)}</p>

                {canPlay && !triviaStarted && (
                  <div>
                    <p className="text-stone-400 text-sm mb-3">
                      Hay una pregunta esperando. Cuando toques "Comenzar" tenés 10 segundos para elegir —
                      no se puede pausar ni volver atrás.
                    </p>
                    <button
                      onClick={startTriviaTimer}
                      className="bg-orange-600 hover:bg-orange-500 text-stone-950 px-4 py-2 rounded font-display font-semibold uppercase text-sm"
                    >
                      Comenzar (10 segundos)
                    </button>
                  </div>
                )}

                {showQuestion && <p className="text-stone-50 text-base font-medium mb-4">{q.question}</p>}

                {canPlay && triviaStarted && (
                  <p className="font-mono text-2xl font-bold text-orange-500 mb-2">{triviaSecondsLeft}</p>
                )}

                {(!canPlay || triviaStarted || revealed) && (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => {
                      let cls = "border-stone-700 text-stone-200 hover:border-orange-600";
                      if (revealed) {
                        if (i === q.correctIndex) {
                          cls = "border-emerald-600 bg-emerald-950/40 text-emerald-300";
                        } else if (i === myAnswer.selectedIndex) {
                          cls = "border-rose-700 bg-rose-950/40 text-rose-300";
                        } else {
                          cls = "border-stone-700 text-stone-500";
                        }
                      }
                      const clickable = triviaStarted && !revealed && myName;
                      return (
                        <button
                          key={i}
                          onClick={() => clickable && answerTriviaAndStop(i)}
                          disabled={!clickable}
                          className={`w-full text-left border rounded-lg px-3 py-2 text-sm transition-colors ${cls} ${
                            clickable ? "cursor-pointer" : "cursor-default"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!myName && (
                  <p className="text-stone-500 text-xs mt-3">Iniciá sesión arriba (elegí tu nombre) para poder responder.</p>
                )}
                {revealed && myAnswer.selectedIndex === -1 && (
                  <p className="text-sm mt-3 font-medium text-rose-400">Se acabó el tiempo — no llegaste a responder.</p>
                )}
                {revealed && myAnswer.selectedIndex !== -1 && (
                  <p className={`text-sm mt-3 font-medium ${myAnswer.correct ? "text-emerald-400" : "text-rose-400"}`}>
                    {myAnswer.correct ? "¡Acertaste! +1 punto" : "Fallaste — ya quedó marcada la correcta arriba."}
                  </p>
                )}

                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-stone-700 flex flex-wrap items-center gap-3">
                    {Object.keys(q.answers).length === 0 ? (
                      <button
                        onClick={() => generateTriviaForDate(latest, data, true)}
                        className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 font-mono uppercase"
                      >
                        <RefreshCw size={12} /> Regenerar pregunta
                      </button>
                    ) : (
                      <p className="text-stone-600 text-xs">
                        Ya hay {Object.keys(q.answers).length} respuesta(s) — no se puede regenerar.
                      </p>
                    )}
                    <button
                      onClick={() => setDeleteTriviaConfirm(latest)}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-400 font-mono uppercase"
                    >
                      <Trash2 size={12} /> Borrar trivia
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {(() => {
            const triviaDates = Object.keys(data.trivia);
            if (triviaDates.length === 0) return null;
            const triviaStats = [...friends, ...data.guests]
              .map((f) => {
                let correct = 0;
                let played = 0;
                triviaDates.forEach((d) => {
                  const a = data.trivia[d].answers[f];
                  if (a) {
                    played += 1;
                    if (a.correct) correct += 1;
                  }
                });
                return { name: f, correct, played };
              })
              .filter((s) => s.played > 0)
              .sort((a, b) => b.correct - a.correct || b.played - a.played);

            if (triviaStats.length === 0) return null;

            return (
              <div className="mt-6">
                <h3 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Ranking Trivia
                </h3>
                <div className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-stone-400 text-xs font-mono uppercase border-b border-stone-700">
                        <th className="text-left px-3 py-2 w-8">#</th>
                        <th className="text-left px-3 py-2">Nombre</th>
                        <th className="text-right px-3 py-2">Puntos</th>
                        <th className="text-right px-3 py-2">Jugadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {triviaStats.map((s, i) => (
                        <tr key={s.name} className="border-b border-stone-700/50 last:border-0">
                          <td className="px-3 py-2 text-stone-500 font-mono">{i + 1}</td>
                          <td className="px-3 py-2 text-stone-50 font-medium">{s.name}</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-orange-500">{s.correct}</td>
                          <td className="px-3 py-2 text-right font-mono text-stone-400">{s.played}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "faq" && (
        <div className="px-5 mt-6">
          <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-4">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-stone-800 border border-stone-700 rounded-lg p-4">
                <p className="text-stone-50 text-sm font-medium mb-1.5">{item.q}</p>
                <p className="text-stone-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "container" && (
        <div className="px-5 mt-6">
          <h2 className="font-display text-lg font-semibold text-stone-100 uppercase tracking-wider mb-1">
            El Container de La Sub
          </h2>
          <p className="text-stone-500 text-xs mb-5">
            Acá no se juzga, se reflexiona.
          </p>

          {(() => {
            const latest = getLatestDate(data.weeks);
            const currentMembers = data.container.members;
            const roundVotes = latest ? data.container.votes[latest] || { entry: {}, exit: {} } : { entry: {}, exit: {} };
            const canVote = myName && data.friends.includes(myName);
            const myEntryVote = roundVotes.entry ? roundVotes.entry[myName] : undefined;
            const myExitVote = roundVotes.exit ? roundVotes.exit[myName] : undefined;
            const entryCandidates = friends.filter((f) => !currentMembers.includes(f));

            const entryVoteCounts = {};
            let entryVotedCount = 0;
            let entryNoneCount = 0;
            Object.values(roundVotes.entry || {}).forEach((choices) => {
              entryVotedCount += 1;
              if (!choices || choices.length === 0) {
                entryNoneCount += 1;
                return;
              }
              choices.forEach((c) => {
                entryVoteCounts[c] = (entryVoteCounts[c] || 0) + 1;
              });
            });

            const exitVoteCounts = {};
            let exitVotedCount = 0;
            let exitNoneCount = 0;
            Object.values(roundVotes.exit || {}).forEach((choices) => {
              exitVotedCount += 1;
              if (!choices || choices.length === 0) {
                exitNoneCount += 1;
                return;
              }
              choices.forEach((c) => {
                exitVoteCounts[c] = (exitVoteCounts[c] || 0) + 1;
              });
            });

            return (
              <>
                {currentMembers.length > 0 && (
                  <div className="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-5">
                    <p className="text-stone-300 text-sm mb-2">
                      <span className="font-semibold text-stone-50">Actualmente en el Container:</span>
                    </p>
                    <div className="space-y-1.5">
                      {currentMembers.map((name) => {
                        const since = data.container.since[name];
                        const duration = since ? weekDates.filter((d) => d >= since).length : 0;
                        return (
                          <div key={name} className="flex items-center justify-between text-sm">
                            <span className="text-stone-100">
                              {name}{" "}
                              <span className="text-stone-500 text-xs font-mono">
                                — {duration} juntada{duration === 1 ? "" : "s"} de reflexión
                              </span>
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => releaseFromContainer(name)}
                                className="text-xs text-sky-500 hover:text-sky-400 font-mono uppercase"
                              >
                                Liberar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!latest ? (
                  <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-6 text-center text-stone-500 text-sm">
                    Todavía no hay ninguna juntada cargada — la votación arranca con la primera.
                  </div>
                ) : (
                  <>
                    {/* VOTO DE ENTRADA */}
                    <div className="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
                      <h3 className="font-display text-sm font-semibold text-stone-100 uppercase tracking-wide mb-1">
                        ¿A quién/quiénes mandás al Container esta semana?
                      </h3>
                      <p className="text-stone-500 text-xs mb-3">
                        El Container no es un castigo — es un ratito aparte para repensar cómo viene cada uno.
                        Votá en anónimo. El Container es un castigo temporal, podés votar a quien vos te parezca
                        que tiene que tomarse un momento de reflexión para pensar cómo viene. Si estás adentro del
                        Container, no lo tomes personal, son tus amigos queriendo lo mejor para vos.
                      </p>

                      {!canVote ? (
                        <p className="text-stone-500 text-xs italic">Solo los titulares pueden votar.</p>
                      ) : myEntryVote !== undefined ? (
                        <p className="text-emerald-400 text-sm">Ya votaste esta ronda. Gracias por participar.</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="space-y-1.5">
                            {entryCandidates.map((f) => (
                              <label
                                key={f}
                                className="flex items-center gap-2 text-sm text-stone-200 bg-stone-900 border border-stone-700 rounded px-3 py-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={entryVoteChoices.includes(f)}
                                  onChange={(e) => {
                                    setEntryVoteChoices((prev) =>
                                      e.target.checked ? [...prev, f] : prev.filter((n) => n !== f)
                                    );
                                  }}
                                  className="accent-rose-600"
                                />
                                {f}
                              </label>
                            ))}
                          </div>
                          <button
                            onClick={() => castEntryVote(entryVoteChoices)}
                            className="bg-rose-700 hover:bg-rose-600 text-stone-50 px-4 py-2 rounded font-display font-semibold uppercase text-sm"
                          >
                            {entryVoteChoices.length === 0 ? "No mando a nadie" : "Votar"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* VOTO DE SALIDA */}
                    {currentMembers.length > 0 && (
                      <div className="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
                        <h3 className="font-display text-sm font-semibold text-stone-100 uppercase tracking-wide mb-1">
                          ¿Merece salir del Container ya?
                        </h3>
                        <p className="text-stone-500 text-xs mb-3">
                          Estos son los que están ahí ahora mismo. Votá si ya reflexionaron lo suficiente, o si
                          preferís que sigan un rato más.
                        </p>

                        {!canVote ? (
                          <p className="text-stone-500 text-xs italic">Solo los titulares pueden votar.</p>
                        ) : myExitVote !== undefined ? (
                          <p className="text-emerald-400 text-sm">Ya votaste esta ronda. Gracias por participar.</p>
                        ) : (
                          <div className="space-y-2">
                            <div className="space-y-1.5">
                              {currentMembers.map((f) => (
                                <label
                                  key={f}
                                  className="flex items-center gap-2 text-sm text-stone-200 bg-stone-900 border border-stone-700 rounded px-3 py-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={exitVoteChoices.includes(f)}
                                    onChange={(e) => {
                                      setExitVoteChoices((prev) =>
                                        e.target.checked ? [...prev, f] : prev.filter((n) => n !== f)
                                      );
                                    }}
                                    className="accent-emerald-600"
                                  />
                                  {f}
                                </label>
                              ))}
                            </div>
                            <button
                              onClick={() => castExitVote(exitVoteChoices)}
                              className="bg-emerald-700 hover:bg-emerald-600 text-stone-50 px-4 py-2 rounded font-display font-semibold uppercase text-sm"
                            >
                              {exitVoteChoices.length === 0 ? "Que sigan pensando, todavía no" : "Votar"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {isAdmin && latest && (
                  <div className="bg-stone-800 border border-sky-800/40 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-sm font-semibold text-sky-400 uppercase tracking-wider">
                        Resultados en vivo (solo admin)
                      </h3>
                      <button
                        onClick={() => setShowContainerResults((s) => !s)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wide flex-shrink-0 ${
                          showContainerResults
                            ? "bg-sky-700 text-stone-50 hover:bg-sky-600"
                            : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                        }`}
                      >
                        {showContainerResults ? "Ocultar" : "Publicar resultados"}
                      </button>
                    </div>

                    {!showContainerResults ? (
                      <p className="text-stone-500 text-xs italic mt-2">
                        Los resultados están ocultos. Tocá "Publicar resultados" para verlos.
                      </p>
                    ) : (
                      <>
                        <p className="text-stone-500 text-xs mb-3">
                          Los votos siguen siendo anónimos — acá solo se ve cuántos votos tiene cada opción, no
                          quién votó qué.
                        </p>

                        <p className="text-stone-400 text-xs font-mono uppercase mb-1.5">
                          Entrada — {entryVotedCount}/{friends.length} votaron
                        </p>
                        {Object.keys(entryVoteCounts).length === 0 && entryNoneCount === 0 ? (
                          <p className="text-stone-600 text-xs italic mb-4">Todavía nadie votó.</p>
                    ) : (
                      <div className="mb-4 space-y-1">
                        {Object.entries(entryVoteCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([name, count]) => (
                            <div key={name} className="flex justify-between text-sm">
                              <span className="text-stone-200">{name}</span>
                              <span className="text-rose-400 font-mono">{count}</span>
                            </div>
                          ))}
                        {entryNoneCount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-500 italic">No mando a nadie</span>
                            <span className="text-stone-500 font-mono">{entryNoneCount}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {currentMembers.length > 0 && (
                      <>
                        <p className="text-stone-400 text-xs font-mono uppercase mb-1.5">
                          Salida — {exitVotedCount}/{friends.length} votaron
                        </p>
                        {Object.keys(exitVoteCounts).length === 0 && exitNoneCount === 0 ? (
                          <p className="text-stone-600 text-xs italic">Todavía nadie votó.</p>
                        ) : (
                          <div className="space-y-1">
                            {Object.entries(exitVoteCounts)
                              .sort((a, b) => b[1] - a[1])
                              .map(([name, count]) => (
                                <div key={name} className="flex justify-between text-sm">
                                  <span className="text-stone-200">{name}</span>
                                  <span className="text-emerald-400 font-mono">{count}</span>
                                </div>
                              ))}
                            {exitNoneCount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-stone-500 italic">Que sigan pensando</span>
                                <span className="text-stone-500 font-mono">{exitNoneCount}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                      </>
                    )}
                  </div>
                )}

                {data.container.history.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Historial del Container
                    </h3>
                    <div className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-stone-400 text-xs font-mono uppercase border-b border-stone-700">
                            <th className="text-left px-3 py-2">Nombre</th>
                            <th className="text-left px-3 py-2">Entró</th>
                            <th className="text-left px-3 py-2">Salió</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...data.container.history]
                            .sort((a, b) => (a.dateOut < b.dateOut ? 1 : -1))
                            .map((h, i) => (
                              <tr key={i} className="border-b border-stone-700/50 last:border-0">
                                <td className="px-3 py-2 text-stone-50 font-medium">{h.name}</td>
                                <td className="px-3 py-2 text-stone-400 font-mono text-xs">{formatDate(h.dateIn)}</td>
                                <td className="px-3 py-2 text-stone-400 font-mono text-xs">{formatDate(h.dateOut)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {activeTab === "findes" && (
        <div className="px-5 mt-6">
          <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Fin de Semana
          </h2>
          <p className="text-stone-500 text-xs mb-4">Asados, previas, juntadas de sábado — aparte de las de los jueves.</p>

          {(() => {
            const weekendDates = Object.keys(data.weekends).sort((a, b) => (a < b ? 1 : -1));
            const totalWeekends = weekendDates.length;

            const weekendStats = friends
              .map((f) => {
                const present = weekendDates.filter((d) => data.weekends[d].attendance[f]).length;
                const pct = totalWeekends ? Math.round((present / totalWeekends) * 100) : 0;
                return { name: f, present, pct };
              })
              .sort((a, b) => b.pct - a.pct || b.present - a.present);

            return (
              <>
                {isAdmin && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                      onClick={() => setShowAddWeekend((s) => !s)}
                      className="flex items-center gap-1 text-xs font-mono uppercase text-orange-500 hover:text-orange-400"
                    >
                      <Plus size={14} /> Finde
                    </button>
                    {missingHistoricalWeekends.length > 0 && (
                      <button
                        onClick={importHistoricalWeekends}
                        className="flex items-center gap-1.5 text-xs font-mono uppercase text-sky-500 hover:text-sky-400"
                      >
                        <RefreshCw size={12} /> Importar histórico ({missingHistoricalWeekends.length})
                      </button>
                    )}
                  </div>
                )}

                {isAdmin && showAddWeekend && (
                  <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 mb-4 flex gap-2 items-center">
                    <input
                      type="date"
                      value={newWeekendDate}
                      onChange={(e) => setNewWeekendDate(e.target.value)}
                      className="bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                    <button
                      onClick={addWeekend}
                      className="bg-orange-600 hover:bg-orange-500 text-stone-950 px-4 py-1.5 rounded font-display font-semibold uppercase text-sm"
                    >
                      Agregar
                    </button>
                  </div>
                )}

                {importMsg && <p className="text-emerald-400 text-xs mb-4">{importMsg}</p>}

                {totalWeekends > 0 && (
                  <div className="mb-6">
                    <h3 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Ranking de findes
                    </h3>
                    <div className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-stone-400 text-xs font-mono uppercase border-b border-stone-700">
                            <th className="text-left px-3 py-2 w-8">#</th>
                            <th className="text-left px-3 py-2">Nombre</th>
                            <th className="text-right px-3 py-2">Asist.</th>
                            <th className="text-right px-3 py-2">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekendStats.map((s, i) => (
                            <tr key={s.name} className="border-b border-stone-700/50 last:border-0">
                              <td className="px-3 py-2 text-stone-500 font-mono">{i + 1}</td>
                              <td className="px-3 py-2 text-stone-50 font-medium">{s.name}</td>
                              <td className="px-3 py-2 text-right text-stone-300 font-mono">
                                {s.present}/{totalWeekends}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-semibold text-orange-500">{s.pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {weekendDates.length === 0 ? (
                  <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-8 text-center text-stone-500 text-sm">
                    Todavía no hay ningún finde cargado.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {weekendDates.map((date) => {
                      const entry = data.weekends[date];
                      const siVinieron = friends.filter((f) => entry.attendance[f]);
                      const noVinieron = friends.filter((f) => !entry.attendance[f]);
                      const isEditingPlan = editingPlanDate === date;
                      return (
                        <div key={date} className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
                          <div className="px-4 py-3 border-b border-stone-700 flex items-center justify-between">
                            <span className="font-display font-semibold text-stone-50 uppercase tracking-wide text-sm flex items-center gap-1.5">
                              <Sun size={14} className="text-amber-500" /> {formatDate(date)}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => deleteWeekend(date)}
                                className="text-stone-600 hover:text-rose-500"
                                aria-label={`Borrar finde ${formatDate(date)}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          <div className="px-4 py-3 border-b border-stone-700">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-stone-400 text-xs font-mono uppercase">Plan del día</span>
                              {isAdmin && !isEditingPlan && (
                                <button
                                  onClick={() => {
                                    setEditingPlanDate(date);
                                    setEditingPlanText(entry.plan || "");
                                  }}
                                  className="text-stone-500 hover:text-orange-500"
                                  aria-label="Editar plan"
                                >
                                  <Pencil size={12} />
                                </button>
                              )}
                            </div>
                            {isEditingPlan ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingPlanText}
                                  onChange={(e) => setEditingPlanText(e.target.value)}
                                  rows={4}
                                  className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1.5 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingPlanDate(null)}
                                    className="text-xs text-stone-400 hover:text-stone-200"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => {
                                      saveWeekendPlan(date, editingPlanText);
                                      setEditingPlanDate(null);
                                    }}
                                    className="text-xs text-orange-500 hover:text-orange-400 font-semibold"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-stone-300 text-sm whitespace-pre-wrap">
                                {entry.plan ? entry.plan : <span className="text-stone-600 italic">Sin programa cargado.</span>}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 px-4 py-3">
                            <div>
                              <div className="text-emerald-500 text-xs font-mono uppercase mb-1.5">
                                Sí vinieron ({siVinieron.length})
                              </div>
                              <div className="space-y-1">
                                {siVinieron.length === 0 ? (
                                  <p className="text-stone-600 text-xs italic">Nadie</p>
                                ) : (
                                  siVinieron.map((f) => (
                                    <button
                                      key={f}
                                      onClick={() => toggleWeekendAttendance(date, f)}
                                      disabled={!isAdmin}
                                      className={`block text-sm text-stone-100 ${isAdmin ? "hover:text-emerald-400 cursor-pointer" : ""}`}
                                    >
                                      {f}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-rose-500 text-xs font-mono uppercase mb-1.5">
                                No vinieron ({noVinieron.length})
                              </div>
                              <div className="space-y-1">
                                {noVinieron.length === 0 ? (
                                  <p className="text-stone-600 text-xs italic">Nadie</p>
                                ) : (
                                  noVinieron.map((f) => (
                                    <button
                                      key={f}
                                      onClick={() => toggleWeekendAttendance(date, f)}
                                      disabled={!isAdmin}
                                      className={`block text-sm text-stone-500 ${isAdmin ? "hover:text-rose-400 cursor-pointer" : ""}`}
                                    >
                                      {f}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="px-4 pb-3">
                              <p className="text-stone-600 text-xs italic">Tocá un nombre para moverlo de lista.</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {activeTab === "estadisticas" && (
        <div className="px-5 mt-6">
          <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Estadísticas
          </h2>
          <p className="text-stone-500 text-xs mb-5">Todo lo que dejaron los jueves, los findes, el Container y la trivia.</p>

          {weekDates.length === 0 ? (
            <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-8 text-center text-stone-500 text-sm">
              Todavía no hay datos suficientes — arrancá cargando alguna juntada.
            </div>
          ) : (
            (() => {
              // ---- GENERAL (jueves) ----
              const attendancePodium = stats.map((s) => ({ name: s.name, value: s.pct }));

              const bestStreaks = friends.map((f) => {
                let best = 0;
                let current = 0;
                weekDatesAsc.forEach((d) => {
                  const cell = normalizeCell(data.weeks[d][f]);
                  if (cell.attended) {
                    current += 1;
                    best = Math.max(best, current);
                  } else {
                    current = 0;
                  }
                });
                return { name: f, best };
              });
              const currentStreaks = stats
                .map((s) => ({ name: s.name, streak: s.streak }))
                .sort((a, b) => b.streak - a.streak)
                .slice(0, 5);
              const bestStreaksSorted = [...bestStreaks].sort((a, b) => b.best - a.best).slice(0, 5);

              const evolutionPoints = weekDatesAsc.map((d) => friends.filter((f) => normalizeCell(data.weeks[d][f]).attended).length);
              const evolutionLabels = weekDatesAsc.map((d) => formatDateShort(d));

              // ---- FIN DE SEMANA ----
              const weekendDates = Object.keys(data.weekends).sort((a, b) => (a < b ? 1 : -1));
              const totalWeekends = weekendDates.length;
              const weekendStatsFull = friends.map((f) => {
                const present = weekendDates.filter((d) => data.weekends[d].attendance[f]).length;
                const pct = totalWeekends ? Math.round((present / totalWeekends) * 100) : 0;
                return { name: f, present, pct };
              });
              const weekendPodium = [...weekendStatsFull].sort((a, b) => b.pct - a.pct).map((s) => ({ name: s.name, value: s.pct }));

              // ---- CONTAINER ----
              const containerCounts = friends
                .map((f) => {
                  const historyCount = data.container.history.filter((h) => h.name === f).length;
                  const currentlyIn = data.container.members.includes(f) ? 1 : 0;
                  return { name: f, value: historyCount + currentlyIn };
                })
                .filter((c) => c.value > 0)
                .sort((a, b) => b.value - a.value);

              const containerDuration = friends
                .map((f) => {
                  let total = 0;
                  data.container.history
                    .filter((h) => h.name === f)
                    .forEach((h) => {
                      total += weekDates.filter((d) => d >= h.dateIn && d <= h.dateOut).length;
                    });
                  if (data.container.members.includes(f) && data.container.since[f]) {
                    total += weekDates.filter((d) => d >= data.container.since[f]).length;
                  }
                  return { name: f, value: total };
                })
                .filter((c) => c.value > 0)
                .sort((a, b) => b.value - a.value);

              // ---- TRIVIA ----
              const triviaDates = Object.keys(data.trivia);
              const triviaStatsFull = [...friends, ...data.guests]
                .map((f) => {
                  let correct = 0;
                  let played = 0;
                  triviaDates.forEach((d) => {
                    const a = data.trivia[d].answers[f];
                    if (a) {
                      played += 1;
                      if (a.correct) correct += 1;
                    }
                  });
                  return { name: f, correct, played };
                })
                .filter((s) => s.played > 0)
                .sort((a, b) => b.correct - a.correct || b.played - a.played);
              const triviaPodium = triviaStatsFull.map((s) => ({ name: s.name, value: s.correct }));

              return (
                <div className="space-y-8">
                  {/* GENERAL */}
                  <div>
                    <h3 className="font-display text-sm font-semibold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Flame size={14} /> General — Jueves
                    </h3>

                    <p className="text-stone-500 text-xs font-mono uppercase mb-2">Podio de asistencia</p>
                    <Podium items={attendancePodium} unit="%" />

                    <div className="grid grid-cols-2 gap-4 mt-5">
                      <div>
                        <p className="text-stone-500 text-xs font-mono uppercase mb-2">Racha actual (top 5)</p>
                        {currentStreaks.filter((s) => s.streak > 0).length === 0 ? (
                          <p className="text-stone-600 text-xs italic">Nadie tiene racha activa.</p>
                        ) : (
                          currentStreaks
                            .filter((s) => s.streak > 0)
                            .map((s) => (
                              <BarRow
                                key={s.name}
                                label={s.name}
                                value={s.streak}
                                max={currentStreaks[0].streak || 1}
                                color="bg-orange-600"
                              />
                            ))
                        )}
                      </div>
                      <div>
                        <p className="text-stone-500 text-xs font-mono uppercase mb-2">Mejor racha histórica</p>
                        {bestStreaksSorted.filter((s) => s.best > 0).length === 0 ? (
                          <p className="text-stone-600 text-xs italic">Sin datos todavía.</p>
                        ) : (
                          bestStreaksSorted
                            .filter((s) => s.best > 0)
                            .map((s) => (
                              <BarRow
                                key={s.name}
                                label={s.name}
                                value={s.best}
                                max={bestStreaksSorted[0].best || 1}
                                color="bg-amber-500"
                              />
                            ))
                        )}
                      </div>
                    </div>

                    <p className="text-stone-500 text-xs font-mono uppercase mt-5 mb-2">Evolución de asistencia por juntada</p>
                    <div className="bg-stone-800 border border-stone-700 rounded-lg p-3">
                      <AttendanceLineChart points={evolutionPoints} labels={evolutionLabels} maxY={friends.length} />
                    </div>
                  </div>

                  {/* FIN DE SEMANA */}
                  {totalWeekends > 0 && (
                    <div>
                      <h3 className="font-display text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Sun size={14} /> Fin de Semana
                      </h3>

                      <p className="text-stone-500 text-xs font-mono uppercase mb-2">Podio de asistencia a los findes</p>
                      <Podium items={weekendPodium} unit="%" />

                      <p className="text-stone-500 text-xs font-mono uppercase mt-5 mb-2">Jueves vs. Finde, por persona</p>
                      <div className="bg-stone-800 border border-stone-700 rounded-lg p-3">
                        {friends.map((f) => {
                          const thu = stats.find((s) => s.name === f);
                          const wknd = weekendStatsFull.find((s) => s.name === f);
                          return (
                            <div key={f} className="mb-3 last:mb-0">
                              <p className="text-stone-200 text-xs font-medium mb-1">{f}</p>
                              <BarRow label="Jueves" value={thu ? thu.pct : 0} max={100} color="bg-orange-600" displayValue={`${thu ? thu.pct : 0}%`} />
                              <BarRow label="Finde" value={wknd ? wknd.pct : 0} max={100} color="bg-amber-500" displayValue={`${wknd ? wknd.pct : 0}%`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CONTAINER */}
                  {containerCounts.length > 0 && (
                    <div>
                      <h3 className="font-display text-sm font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Package size={14} /> Container
                      </h3>

                      <p className="text-stone-500 text-xs font-mono uppercase mb-2">Más mandados al Container</p>
                      <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 mb-4">
                        {containerCounts.map((c) => (
                          <BarRow key={c.name} label={c.name} value={c.value} max={containerCounts[0].value} color="bg-rose-600" />
                        ))}
                      </div>

                      {containerDuration.length > 0 && (
                        <>
                          <p className="text-stone-500 text-xs font-mono uppercase mb-2">Tiempo acumulado adentro (en juntadas)</p>
                          <div className="bg-stone-800 border border-stone-700 rounded-lg p-3">
                            {containerDuration.map((c) => (
                              <BarRow key={c.name} label={c.name} value={c.value} max={containerDuration[0].value} color="bg-rose-700" />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* TRIVIA */}
                  {triviaPodium.length > 0 && (
                    <div>
                      <h3 className="font-display text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        ⚽ Trivia
                      </h3>
                      <p className="text-stone-500 text-xs font-mono uppercase mb-2">Podio de puntos</p>
                      <Podium items={triviaPodium} />
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {activeTab === "contacto" && (
        <div className="px-5 mt-6">
          <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Contáctanos
          </h2>
          <p className="text-stone-500 text-xs mb-5">Tus mensajes acá solo los ve el admin.</p>

          <div className="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-lg">💼</span>
              <h3 className="font-display text-sm font-semibold text-stone-100 uppercase tracking-wide">
                ¿Te gustaría formar parte del equipo de developers de La Sub?
              </h3>
            </div>
            <p className="text-stone-500 text-xs mb-3">
              Dejanos un mensaje o mandanos tu currículum si te interesa sumarte al equipo de developers de La
              Sub. Nos vamos a estar comunicando con vos (o no).
            </p>
            {!myName ? (
              <p className="text-stone-500 text-xs italic">Iniciá sesión arriba para postularte.</p>
            ) : devMessageSent ? (
              <p className="text-emerald-400 text-sm">¡Gracias por postularte! Te vamos a estar contactando.</p>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={devMessageDraft}
                  onChange={(e) => setDevMessageDraft(e.target.value)}
                  rows={3}
                  placeholder="Tu currículum / mensaje..."
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
                <button
                  onClick={() => addContactMessage("developer", devMessageDraft)}
                  disabled={!devMessageDraft.trim()}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 px-4 py-2 rounded font-display font-semibold uppercase text-sm"
                >
                  Enviar postulación
                </button>
              </div>
            )}
          </div>

          <div className="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-lg">📮</span>
              <h3 className="font-display text-sm font-semibold text-stone-100 uppercase tracking-wide">
                Buzón de sugerencias
              </h3>
            </div>
            <p className="text-stone-500 text-xs mb-3">
              ¿Se te ocurrió algo para la app, una idea, una queja, un chisme? Dejalo acá. Y si tenés ganas de
              insultar a los developers de La Sub, este también es tu espacio para hacerlo.
            </p>
            {!myName ? (
              <p className="text-stone-500 text-xs italic">Iniciá sesión arriba para dejar tu sugerencia.</p>
            ) : suggestionSent ? (
              <p className="text-emerald-400 text-sm">¡Gracias! Ya quedó registrada.</p>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={suggestionDraft}
                  onChange={(e) => setSuggestionDraft(e.target.value)}
                  rows={3}
                  placeholder="Tu sugerencia..."
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
                <button
                  onClick={() => addContactMessage("suggestion", suggestionDraft)}
                  disabled={!suggestionDraft.trim()}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 px-4 py-2 rounded font-display font-semibold uppercase text-sm"
                >
                  Enviar sugerencia
                </button>
              </div>
            )}
          </div>

          {isAdmin && data.contactMessages.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Mensajes recibidos (solo admin)
              </h3>
              <div className="space-y-2">
                {[...data.contactMessages]
                  .sort((a, b) => b.ts - a.ts)
                  .map((m) => (
                    <div key={m.id} className="bg-stone-800 border border-stone-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-stone-50 text-sm font-medium">
                          {m.author}{" "}
                          <span className="text-stone-500 text-xs font-mono uppercase">
                            {m.type === "developer" ? "· postulación" : "· sugerencia"}
                          </span>
                        </span>
                        <span className="text-stone-500 text-xs font-mono">{formatDateTime(m.ts)}</span>
                      </div>
                      <p className="text-stone-300 text-sm whitespace-pre-wrap">{m.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-20">
          <div className="bg-stone-800 border border-stone-700 rounded-lg p-6 w-full max-w-xs">
            <h3 className="font-display text-lg font-semibold text-stone-50 uppercase tracking-wide mb-3">
              PIN de admin
            </h3>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              placeholder="••••"
              autoFocus
              className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            {pinError && <div className="text-red-400 text-xs mb-2">{pinError}</div>}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput("");
                  setPinError("");
                }}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 py-2 rounded text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-stone-950 py-2 rounded text-sm font-semibold"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {reasonModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-20">
          <div className="bg-stone-800 border border-stone-700 rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-display text-lg font-semibold text-stone-50 uppercase tracking-wide mb-1">
              {reasonModal.friend}
            </h3>
            <p className="text-stone-400 text-xs font-mono mb-4">{formatDate(reasonModal.date)}</p>

            <label className="block text-stone-300 text-xs font-mono uppercase tracking-wider mb-2">
              Motivo (opcional)
            </label>
            {reasonModal.mode === "edit" ? (
              <textarea
                value={reasonModal.draft}
                onChange={(e) => setReasonModal({ ...reasonModal, draft: e.target.value })}
                placeholder="Ej: viaje de laburo, cumpleaños..."
                rows={3}
                className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            ) : (
              <p className="text-stone-200 text-sm mb-4 min-h-[1.5rem]">
                {reasonModal.draft ? reasonModal.draft : <span className="text-stone-500 italic">Sin motivo cargado.</span>}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setReasonModal(null)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 py-2 rounded text-sm"
              >
                {reasonModal.mode === "edit" ? "Cancelar" : "Cerrar"}
              </button>
              {reasonModal.mode === "edit" && (
                <button
                  onClick={saveReason}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-stone-950 py-2 rounded text-sm font-semibold"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmDate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-20">
          <div className="bg-stone-800 border border-stone-700 rounded-lg p-6 w-full max-w-xs">
            <h3 className="font-display text-lg font-semibold text-stone-50 uppercase tracking-wide mb-3">
              Borrar juntada
            </h3>
            <p className="text-stone-300 text-sm mb-5">
              ¿Eliminar la juntada <span className="text-stone-50 font-medium">{formatDate(deleteConfirmDate)}</span>?
              Se borra toda la asistencia cargada para esa fecha. No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmDate(null)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 py-2 rounded text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteWeek}
                className="flex-1 bg-rose-700 hover:bg-rose-600 text-stone-50 py-2 rounded text-sm font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTriviaConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-20">
          <div className="bg-stone-800 border border-stone-700 rounded-lg p-6 w-full max-w-xs">
            <h3 className="font-display text-lg font-semibold text-stone-50 uppercase tracking-wide mb-3">
              Borrar trivia
            </h3>
            <p className="text-stone-300 text-sm mb-5">
              ¿Eliminar la trivia de la juntada del{" "}
              <span className="text-stone-50 font-medium">{formatDate(deleteTriviaConfirm)}</span>? Se borran también
              las respuestas ya cargadas de esa pregunta. No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTriviaConfirm(null)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 py-2 rounded text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTrivia(deleteTriviaConfirm);
                  setDeleteTriviaConfirm(null);
                }}
                className="flex-1 bg-rose-700 hover:bg-rose-600 text-stone-50 py-2 rounded text-sm font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteWeekendConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-20">
          <div className="bg-stone-800 border border-stone-700 rounded-lg p-6 w-full max-w-xs">
            <h3 className="font-display text-lg font-semibold text-stone-50 uppercase tracking-wide mb-3">
              Borrar finde
            </h3>
            <p className="text-stone-300 text-sm mb-5">
              ¿Eliminar el finde del{" "}
              <span className="text-stone-50 font-medium">{formatDate(deleteWeekendConfirm)}</span>? Se borra el
              plan y la asistencia cargada. No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteWeekendConfirm(null)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 py-2 rounded text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteWeekend}
                className="flex-1 bg-rose-700 hover:bg-rose-600 text-stone-50 py-2 rounded text-sm font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
