import type { LevelNumber, MathProblem, PlayerStats } from '../types/game';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions(answer: number): number[] {
  const set = new Set<number>([answer]);
  const offsets = shuffle([-3, -2, -1, 1, 2, 3, 4, -4]);

  for (const offset of offsets) {
    if (set.size >= 3) break;
    const candidate = answer + offset;
    if (candidate >= 0 && candidate !== answer) {
      set.add(candidate);
    }
  }

  let fallback = 1;
  while (set.size < 3) {
    if (answer + fallback >= 0) set.add(answer + fallback);
    fallback++;
  }

  return shuffle(Array.from(set));
}

function buildHint(a: number, b: number, op: '+' | '-'): string {
  if (op === '+') {
    return `Pista: empieza en ${a} y suma ${b} pasitos hacia adelante.`;
  }
  return `Pista: empieza en ${a} y retrocede ${b} pasitos hacia atrás.`;
}

/**
 * Genera operaciones matemáticas aleatorias progresivas según el nivel.
 */
export function generateMathProblem(level: LevelNumber, round = 0): MathProblem {
  let a = 5;
  let b = 3;
  let op: '+' | '-' = '+';

  if (level === 1) {
    // Nivel 1: sumas y restas básicas amigables
    if (round === 0) {
      op = '+';
      a = randInt(2, 9);
      b = randInt(2, 8);
    } else if (round === 1) {
      op = '-';
      a = randInt(6, 14);
      b = randInt(2, Math.min(8, a - 1));
    } else {
      op = Math.random() > 0.45 ? '+' : '-';
      if (op === '+') {
        a = randInt(5, 11);
        b = randInt(4, 9);
      } else {
        a = randInt(10, 17);
        b = randInt(3, 8);
      }
    }
  } else if (level === 2) {
    // Nivel 2: decisiones rápidas en autopista (sumas y restas hasta ~22)
    op = Math.random() > 0.45 ? '+' : '-';
    if (op === '+') {
      a = randInt(6, 13);
      b = randInt(4, 9);
    } else {
      a = randInt(11, 20);
      b = randInt(3, 9);
    }
  } else {
    // Nivel 3: conteo activo con saltos (resultado entre 4 y 10 para mantener ritmo divertido)
    const target = randInt(4, 10);
    op = Math.random() > 0.45 ? '+' : '-';
    if (op === '+') {
      a = randInt(1, target - 1);
      b = target - a;
    } else {
      b = randInt(2, 7);
      a = target + b;
    }
  }

  const answer = op === '+' ? a + b : a - b;
  const options = buildOptions(answer);

  return {
    id: `${level}-${round}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    a,
    b,
    op,
    answer,
    options,
    text: `${a} ${op} ${b} = ?`,
    hint: buildHint(a, b, op),
  };
}

/**
 * Genera una respuesta personalizada y motivadora del Búho Mentor
 * analizando la reflexión escrita por el niño o niña.
 */
export function buildOwlReflectionReply(
  favoriteLevel: string,
  reflectionText: string,
  stats: PlayerStats
): string {
  const cleanText = reflectionText.trim();
  const lower = cleanText.toLowerCase();

  let strategyPraise =
    '¡Qué gran manera de pensar! Explicar cómo llegas a una respuesta convierte tu mente en un superpoder matemático.';

  if (lower.includes('dedo') || lower.includes('mano')) {
    strategyPraise =
      '¡Contar con los dedos es una herramienta fantástica! Incluso los grandes científicos empezaron usando sus manos para visualizar los números.';
  } else if (lower.includes('cabeza') || lower.includes('mente') || lower.includes('mental')) {
    strategyPraise =
      '¡Wow, cálculo mental! Visualizar los números en tu cabeza demuestra muchísima agilidad y concentración.';
  } else if (lower.includes('salto') || lower.includes('saltar') || lower.includes('paso')) {
    strategyPraise =
      '¡Usar saltos y pasitos para contar hace que los números cobren vida! Cada salto refuerza tu memoria numérica.';
  } else if (lower.includes('diez') || lower.includes('10') || lower.includes('agrup')) {
    strategyPraise =
      '¡Agrupar de 10 en 10 es un truco de auténtico maestro! Así se resuelven sumas gigantes en segundos.';
  } else if (lower.includes('cont') || lower.includes('sum') || lower.includes('rest')) {
    strategyPraise =
      '¡Excelente observación! Ir paso a paso contando hacia adelante para sumar o hacia atrás para restar nunca falla.';
  }

  const levelNote = favoriteLevel
    ? ` Me encantó saber que disfrutaste especialmente "${favoriteLevel}".`
    : '';

  const accuracy =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)
      : 100;

  return `${strategyPraise}${levelNote} Con ${stats.coins} monedas acumuladas y un ${accuracy}% de precisión, ¡ya estás listo para recibir tu Medalla Oficial de MateAventura 3D!`;
}
