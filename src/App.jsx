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
    q: "¿Para qué sirve el Foro?",
    a: "Es un hilo de comentarios por cada jueves, para tirar anécdotas, chistes o lo que sea de esa juntada. Cualquiera con sesión iniciada puede escribir. Es vía libre: están permitidos los insultos y las faltas de respeto, cada uno pone lo que quiere — pero lo hace bajo su propio nombre y se hace responsable de lo que escribe. Ni el admin puede borrar comentarios.",
  },
  {
    q: "¿Cómo funciona la Trivia?",
    a: 'Se genera una pregunta nueva cada vez que el admin agrega una juntada — una por juntada, la misma para todos. Tenés que iniciar sesión para jugar. Al entrar ves un botón "Comenzar" — recién ahí aparece la pregunta y tenés 10 segundos para elegir una opción, así no da tiempo a buscarla. Acertar suma un punto al ranking de Trivia.',
  },
  {
    q: "¿Mi contraseña es segura?",
    a: "No es un sistema de seguridad bancario — es solo una traba para que no cualquiera comente o cargue excusas en nombre de otro dentro del grupo.",
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
    friendAuth: d.friendAuth && typeof d.friendAuth === "object" ? d.friendAuth : {},
    trivia: d.trivia && typeof d.trivia === "object" ? d.trivia : {},
    calendar: d.calendar && typeof d.calendar === "object" ? d.calendar : {},
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getLatestDate(weeksObj) {
  const dates = Object.keys(weeksObj || {});
  if (dates.length === 0) return null;
  return dates.sort((a, b) => (a < b ? 1 : -1))[0];
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
  const [welcomeDismissed, setWelcomeDismissed] = useState(true);
  const [welcomeChecked, setWelcomeChecked] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});

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
    persist({ friends, pin: setupPin.trim(), weeks: {}, guests: [], guestLog: [], comments: {}, friendAuth: {}, trivia: {}, calendar: {} });
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
    const next = {
      ...data,
      weeks: { ...data.weeks, [newDate]: emptyWeekRow(data.friends) },
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

  const generateTriviaForDate = async (targetDate, baseData) => {
    setTriviaLoading(true);
    setTriviaError("");
    try {
      const response = await fetch("/api/trivia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate }),
      });
      const parsed = await response.json();
      if (!response.ok) {
        throw new Error(parsed.error || "Error generando la trivia");
      }
      if (
        !parsed.question ||
        !Array.isArray(parsed.options) ||
        parsed.options.length !== 4 ||
        typeof parsed.correctIndex !== "number" ||
        parsed.correctIndex < 0 ||
        parsed.correctIndex > 3
      ) {
        throw new Error("Formato inesperado");
      }
      persist({
        ...baseData,
        trivia: {
          ...baseData.trivia,
          [targetDate]: {
            question: parsed.question,
            options: parsed.options,
            correctIndex: parsed.correctIndex,
            generatedAt: Date.now(),
            answers: {},
          },
        },
      });
    } catch (e) {
      setTriviaError("No se pudo generar la trivia de esta juntada. Probá de nuevo.");
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
      friendAuth: nextFriendAuth,
      trivia: nextTrivia,
    });

    if (myName === oldName) {
      setMyName(clean);
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
              <p className="text-stone-50 text-sm font-medium mb-2">¡Bienvenido al foro de juntadas de La Sub! 🔥</p>
              <p className="text-stone-400 text-sm mb-2">
                Acá vamos a ir dejando registrado quién vino y quién faltó a cada juntada semanal, quién fue
                anfitrión, y todo lo que se les cante compartir en el foro.
              </p>
              <p className="text-stone-400 text-sm">
                Para entrar: elegí tu nombre en la lista de abajo y creá tu propia contraseña — es la primera y
                única vez que la vas a tener que inventar, después el dispositivo te va a reconocer solo. Con la
                sesión iniciada podés cargar tu excusa si faltás y comentar lo que quieras en el foro.
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

      <div className="px-5 pt-4 flex gap-2">
        <button
          onClick={() => setActiveTab("planilla")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-colors ${
            activeTab === "planilla" ? "bg-orange-600 text-stone-950" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
          }`}
        >
          <Flame size={13} /> Panel General
        </button>
        <button
          onClick={() => setActiveTab("foro")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-colors ${
            activeTab === "foro" ? "bg-orange-600 text-stone-950" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
          }`}
        >
          <MessagesSquare size={13} /> Foro
        </button>
        <button
          onClick={() => setActiveTab("trivia")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-colors ${
            activeTab === "trivia" ? "bg-orange-600 text-stone-950" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
          }`}
        >
          ⚽ Trivia
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-colors ${
            activeTab === "faq" ? "bg-orange-600 text-stone-950" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
          }`}
        >
          <HelpCircle size={13} /> FAQ
        </button>
      </div>

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

      {activeTab === "planilla" && (
        <>
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
              Cambia el nombre en el plantel, en toda la planilla histórica y en los comentarios del foro.
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

      {activeTab === "foro" && (
        <div className="px-5 mt-6">
          <h2 className="font-display text-sm font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Foro semanal
          </h2>
          <p className="text-stone-500 text-xs mb-4">Un hilo de comentarios por cada juntada.</p>

          {weekDates.length === 0 ? (
            <div className="bg-stone-800 border border-dashed border-stone-700 rounded-lg p-8 text-center text-stone-500 text-sm">
              Todavía no hay juntadas cargadas en la planilla.
            </div>
          ) : (
            <div className="space-y-4">
              {weekDates.map((date) => {
                const weekComments = data.comments[date] || [];
                const presentCount = friends.filter((f) => normalizeCell(data.weeks[date][f]).attended).length;
                const hostName = friends.find((f) => normalizeCell(data.weeks[date][f]).host);
                return (
                  <div key={date} className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-stone-700 flex items-center justify-between flex-wrap gap-1">
                      <span className="font-display font-semibold text-stone-50 uppercase tracking-wide text-sm">
                        {formatDate(date)}
                      </span>
                      <span className="text-stone-400 text-xs font-mono">
                        {presentCount} presentes{hostName ? ` · anfitrión: ${hostName}` : ""}
                      </span>
                    </div>

                    <div className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto">
                      {weekComments.length === 0 ? (
                        <p className="text-stone-500 text-xs italic">Todavía nadie comentó esta juntada.</p>
                      ) : (
                        weekComments.map((c) => (
                          <div key={c.id}>
                            <div className="flex items-baseline gap-2">
                              <span className="text-stone-50 text-sm font-medium">{c.author}</span>
                              <span className="text-stone-500 text-xs font-mono">{formatDateTime(c.ts)}</span>
                            </div>
                            <p className="text-stone-300 text-sm whitespace-pre-wrap">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-stone-700 flex gap-2">
                      <input
                        type="text"
                        value={commentDrafts[date] || ""}
                        onChange={(e) => setCommentDrafts({ ...commentDrafts, [date]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && addComment(date)}
                        placeholder={myName ? "Escribí algo sobre esta juntada..." : "Elegí tu nombre arriba para comentar"}
                        disabled={!myName}
                        className="flex-1 bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:opacity-50"
                      />
                      <button
                        onClick={() => addComment(date)}
                        disabled={!myName || !(commentDrafts[date] || "").trim()}
                        className="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 px-3 rounded flex items-center justify-center"
                        aria-label="Enviar comentario"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
              <Sparkles size={12} /> generada por IA
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
                        onClick={() => generateTriviaForDate(latest, data)}
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
            const triviaStats = friends
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
    </div>
  );
}
