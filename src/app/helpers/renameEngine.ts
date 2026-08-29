import { Substitution } from "../models/Interfaces";

/**
 * Motor de renombrado con diff por segmentos para el limpiador de nombres.
 *
 * Calcula, para cada nombre de archivo, qué trozos se eliminan (patrón o
 * regla de sustitución), qué trozos se añaden (reemplazos) y qué trozos se
 * conservan, de modo que la UI pueda pintar el diff y atribuir cada cambio a
 * su origen (trazabilidad por regla).
 *
 * Comportamiento:
 *  - La extensión queda exenta: patrón y reglas solo tocan el nombre base.
 *  - El patrón es un CORTE (semántica histórica de la app): desde su primera
 *    coincidencia hasta el final del nombre base se elimina todo. Se intenta
 *    como regex y, si no compila (p. ej. "(Spa"), como texto literal.
 *  - Las reglas se aplican en orden sobre los tramos aún no marcados.
 *  - Los espacios duplicados se colapsan y los separadores sueltos al
 *    principio/final del nombre base se recortan (origen "cleanup").
 */

export type SegmentSource = "pattern" | "cleanup" | number;

export interface RenameSegment {
  text: string;
  kind: "keep" | "del" | "add";
  source?: SegmentSource;
}

export interface RenamePlan {
  fixed: string;
  segments: RenameSegment[];
  changed: boolean;
}

interface Span {
  start: number;
  end: number; // exclusivo
  source: SegmentSource;
  replace: string;
}

const TRIM_CHARS = new Set([" ", ".", "-", "_"]);

const safeRegex = (source: string, flags: string): RegExp | null => {
  try {
    return new RegExp(source, flags);
  } catch {
    return null;
  }
};

const escapeRegex = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Encuentra tramos que casan con `re` y no pisan posiciones ya ocupadas. */
const collectSpans = (
  base: string,
  re: RegExp,
  occupied: boolean[],
  source: SegmentSource,
  replace: string,
  out: Span[]
) => {
  let match: RegExpExecArray | null;
  while ((match = re.exec(base)) !== null) {
    if (match[0] === "") {
      re.lastIndex++;
      continue;
    }
    const start = match.index;
    const end = start + match[0].length;
    let free = true;
    for (let i = start; i < end; i++) {
      if (occupied[i]) {
        free = false;
        break;
      }
    }
    if (free) {
      for (let i = start; i < end; i++) occupied[i] = true;
      out.push({ start, end, source, replace });
    }
  }
};

export const computeRenamePlan = (
  filename: string,
  substitutions: Substitution[],
  pattern: string
): RenamePlan => {
  const dotIndex = filename.lastIndexOf(".");
  const ext = dotIndex > 0 ? filename.slice(dotIndex) : "";
  const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;

  const occupied: boolean[] = new Array(base.length).fill(false);
  const spans: Span[] = [];

  // 1. Patrón de corte: desde la primera coincidencia hasta el final.
  //    Regex si compila; si no (p. ej. "(Spa"), como texto literal.
  if (pattern && pattern.trim() !== "") {
    const re =
      safeRegex(pattern, "i") || safeRegex(escapeRegex(pattern), "i");
    if (re) {
      const match = re.exec(base);
      if (match && match[0] !== "" && match.index < base.length) {
        for (let i = match.index; i < base.length; i++) occupied[i] = true;
        spans.push({
          start: match.index,
          end: base.length,
          source: "pattern",
          replace: "",
        });
      }
    }
  }

  // 2. Reglas de sustitución, en orden (regex; si no compila, literal)
  substitutions.forEach((rule, index) => {
    if (!rule.find) return;
    const re =
      safeRegex(rule.find, "gi") || safeRegex(escapeRegex(rule.find), "gi");
    if (re) collectSpans(base, re, occupied, index, rule.replace || "", spans);
  });

  spans.sort((a, b) => a.start - b.start);

  // 3. Construir unidades por carácter del resultado, con su origen
  interface Unit {
    text: string;
    kind: "keep" | "del" | "add";
    source?: SegmentSource;
  }
  const units: Unit[] = [];
  let cursor = 0;
  for (const span of spans) {
    for (let i = cursor; i < span.start; i++) {
      units.push({ text: base[i], kind: "keep" });
    }
    units.push({
      text: base.slice(span.start, span.end),
      kind: "del",
      source: span.source,
    });
    for (const ch of span.replace) {
      units.push({ text: ch, kind: "add", source: span.source });
    }
    cursor = span.end;
  }
  for (let i = cursor; i < base.length; i++) {
    units.push({ text: base[i], kind: "keep" });
  }

  // 4. Colapsar espacios duplicados del resultado (keep/add contribuyen)
  let prevWasSpace = true; // también recorta espacios iniciales
  for (const unit of units) {
    if (unit.kind === "del") continue;
    if (unit.text === " ") {
      if (prevWasSpace) {
        if (unit.kind === "keep") {
          unit.kind = "del";
          unit.source = "cleanup";
        } else {
          unit.text = ""; // un añadido redundante simplemente no se emite
        }
      } else {
        prevWasSpace = true;
      }
    } else if (unit.text !== "") {
      prevWasSpace = false;
    }
  }

  // 5. Recortar separadores sueltos al final del nombre base
  for (let i = units.length - 1; i >= 0; i--) {
    const unit = units[i];
    if (unit.kind === "del" || unit.text === "") continue;
    if (unit.text.length === 1 && TRIM_CHARS.has(unit.text)) {
      if (unit.kind === "keep") {
        unit.kind = "del";
        unit.source = "cleanup";
      } else {
        unit.text = "";
      }
    } else {
      break;
    }
  }

  // 6. Agrupar unidades consecutivas equivalentes en segmentos
  const segments: RenameSegment[] = [];
  for (const unit of units) {
    if (unit.text === "") continue;
    const last = segments[segments.length - 1];
    if (last && last.kind === unit.kind && last.source === unit.source) {
      last.text += unit.text;
    } else {
      segments.push({ text: unit.text, kind: unit.kind, source: unit.source });
    }
  }

  let fixedBase = segments
    .filter((s) => s.kind !== "del")
    .map((s) => s.text)
    .join("");

  // Nunca dejar el nombre vacío: si todo se eliminó, no se cambia nada
  if (fixedBase.trim() === "") {
    return {
      fixed: filename,
      segments: [{ text: base, kind: "keep" }, ...(ext ? [{ text: ext, kind: "keep" as const }] : [])],
      changed: false,
    };
  }

  if (ext) {
    segments.push({ text: ext, kind: "keep" });
  }
  const fixed = fixedBase + ext;
  return { fixed, segments, changed: fixed !== filename };
};

/** Cuenta coincidencias (segmentos eliminados) por origen, para el carril. */
export const countMatchesBySource = (
  plans: RenamePlan[]
): Map<SegmentSource, number> => {
  const counts = new Map<SegmentSource, number>();
  for (const plan of plans) {
    for (const seg of plan.segments) {
      if (seg.kind === "del" && seg.source !== undefined && seg.source !== "cleanup") {
        counts.set(seg.source, (counts.get(seg.source) || 0) + 1);
      }
    }
  }
  return counts;
};

/**
 * Detecta colisiones: dos o más archivos cuyo nombre final coincidiría
 * (ignorando mayúsculas). Devuelve el conjunto de nombres finales en conflicto.
 */
export const detectConflicts = (
  targets: { filename: string; target: string; active: boolean }[]
): Set<string> => {
  const seen = new Map<string, number>();
  for (const t of targets) {
    const key = (t.active ? t.target : t.filename).toLowerCase();
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  const conflicts = new Set<string>();
  for (const t of targets) {
    if (!t.active) continue;
    const key = t.target.toLowerCase();
    if ((seen.get(key) || 0) > 1) {
      conflicts.add(key);
    }
  }
  return conflicts;
};
