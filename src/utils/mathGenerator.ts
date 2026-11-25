import type {
  CartesianChallenge,
  MathProblem,
  PlayerStats,
  ProbabilityScenario,
} from '../types/game';

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

function buildNumberOptions(answer: number): number[] {
  const set = new Set<number>([answer]);
  const offsets = shuffle([-4, -3, -2, -1, 1, 2, 3, 4, 5]);
  for (const offset of offsets) {
    if (set.size >= 3) break;
    const c = answer + offset;
    if (c >= 1 && c !== answer) set.add(c);
  }
  let f = 1;
  while (set.size < 3) {
    if (answer + f > 0) set.add(answer + f);
    f++;
  }
  return shuffle(Array.from(set));
}

/**
 * Nivel 1: Batalla de Superhéroes con tema de Proporciones y Probabilidad.
 */
export function generateBattleProblem(round: number): MathProblem {
  const id = `battle-${round}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Rondas pares: Proporciones visuales y cotidianas; Rondas impares: Probabilidad
  if (round % 2 === 0) {
    const template = randInt(0, 2);
    if (template === 0) {
      const perUnit = randInt(2, 5);
      const base = randInt(1, 2);
      const mult = randInt(2, 3);
      const p1 = base;
      const g1 = base * perUnit;
      const p2 = base * mult;
      const answer = g1 * mult;
      return {
        id,
        category: 'proportions',
        prompt: `Para preparar ${p1} poción${p1 > 1 ? 'es' : ''} mágica${p1 > 1 ? 's' : ''} se usan ${g1} gemas. ¿Cuántas gemas necesitas para ${p2} pociones?`,
        shortExpr: `${p1} poción → ${g1} 💎  |  ${p2} pociones → ?`,
        answer,
        options: buildNumberOptions(answer),
        hint: `Es una proporción: multiplicamos ${g1} gemas × ${mult} (porque ${p2} es ${mult} veces ${p1}).`,
        visualBadge: `${'💎'.repeat(Math.min(6, g1))} × ${mult}`,
      };
    } else if (template === 1) {
      const perShield = randInt(2, 4);
      const shields = randInt(2, 4);
      const answer = perShield * shields;
      return {
        id,
        category: 'proportions',
        prompt: `Si 1 escudo aliado protege a ${perShield} héroes, ¿a cuántos héroes protegen ${shields} escudos iguales?`,
        shortExpr: `1 🛡️ → ${perShield} héroes  |  ${shields} 🛡️ → ?`,
        answer,
        options: buildNumberOptions(answer),
        hint: `Suma ${perShield} héroes por cada escudo (${shields} veces ${perShield}).`,
        visualBadge: `${'🛡️'.repeat(shields)}`,
      };
    } else {
      const bluePerRed = randInt(2, 4);
      const redCount = randInt(2, 3);
      const answer = bluePerRed * redCount;
      return {
        id,
        category: 'proportions',
        prompt: `La receta estelar usa ${bluePerRed} cristales azules por cada 1 cristal rojo. Si pones ${redCount} rojos, ¿cuántos azules van?`,
        shortExpr: `1 🔴 : ${bluePerRed} 🔵  ::  ${redCount} 🔴 : ?`,
        answer,
        options: buildNumberOptions(answer),
        hint: `Por cada cristal rojo hay ${bluePerRed} azules. Multiplica ${bluePerRed} × ${redCount}.`,
        visualBadge: `${'🔴'.repeat(redCount)} → ? 🔵`,
      };
    }
  } else {
    // Preguntas de Probabilidad
    const template = randInt(0, 2);
    if (template === 0) {
      const gold = randInt(5, 8);
      const green = 1;
      const goldWins = Math.random() > 0.35;
      const gCount = goldWins ? gold : green;
      const vCount = goldWins ? green : gold;
      const answer = goldWins ? 'Moneda Dorada' : 'Moneda Verde';
      return {
        id,
        category: 'probability',
        prompt: `En un cofre hay ${gCount} moneda${gCount > 1 ? 's' : ''} dorada${gCount > 1 ? 's' : ''} y ${vCount} moneda${vCount > 1 ? 's' : ''} verde${vCount > 1 ? 's' : ''}. Si sacas 1 sin mirar, ¿qué es MÁS probable?`,
        shortExpr: `${gCount} 🟡 vs ${vCount} 🟢 — ¿Más probable?`,
        answer,
        options: shuffle(['Moneda Dorada', 'Moneda Verde', 'Es imposible sacar alguna']),
        hint: `El color que tiene mayor cantidad en el cofre siempre tiene mayor probabilidad de salir.`,
        visualBadge: `${'🟡'.repeat(gCount)} ${'🟢'.repeat(vCount)}`,
      };
    } else if (template === 1) {
      const equalCount = randInt(3, 6);
      const answer = '1/2 (Mitad y mitad)';
      return {
        id,
        category: 'probability',
        prompt: `En una bolsa hay exactamente ${equalCount} canicas rojas y ${equalCount} canicas azules. ¿Cuál es la probabilidad de sacar una roja?`,
        shortExpr: `${equalCount} 🔴 y ${equalCount} 🔵 — Probabilidad de 🔴`,
        answer,
        options: shuffle([answer, 'Seguro (100%)', 'Imposible (0%)']),
        hint: `Como hay la misma cantidad de rojas y azules (${equalCount} y ${equalCount}), la probabilidad es justo la mitad: 1/2.`,
        visualBadge: `${'🔴'.repeat(equalCount)} ${'🔵'.repeat(equalCount)}`,
      };
    } else {
      const askImpossible = Math.random() > 0.5;
      if (askImpossible) {
        const answer = 'Sacar un 9';
        return {
          id,
          category: 'probability',
          prompt: `Si lanzas un dado normal de 6 caras (números del 1 al 6), ¿qué resultado es IMPOSIBLE que salga?`,
          shortExpr: `Dado (1 al 6) — Evento IMPOSIBLE`,
          answer,
          options: shuffle(['Sacar un 9', 'Sacar un 4', 'Sacar número par']),
          hint: `Un dado normal solo llega hasta el 6, así que sacar un número mayor nunca puede ocurrir.`,
          visualBadge: '🎲 1 · 2 · 3 · 4 · 5 · 6',
        };
      } else {
        const answer = 'Menor que 7 (Seguro)';
        return {
          id,
          category: 'probability',
          prompt: `Al lanzar un dado normal del 1 al 6, ¿qué evento es SEGURO que ocurra?`,
          shortExpr: `Dado (1 al 6) — Evento SEGURO`,
          answer,
          options: shuffle([answer, 'Sacar siempre 6', 'Sacar un 0']),
          hint: `Todos los números del dado (1, 2, 3, 4, 5 y 6) son menores que 7.`,
          visualBadge: '🎲 1 · 2 · 3 · 4 · 5 · 6',
        };
      }
    }
  }
}

/**
 * Nivel 2: Carrera Matemática (operaciones rápidas y proporción de velocidad).
 */
export function generateRaceProblem(gate: number): MathProblem {
  const id = `race-${gate}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (gate === 2) {
    const speed = randInt(3, 6);
    const secs = randInt(2, 4);
    const answer = speed * secs;
    return {
      id,
      category: 'proportions',
      prompt: `Tu kart avanza ${speed} m por segundo. ¿Cuántos metros recorre en ${secs} segundos?`,
      shortExpr: `${speed} m/s × ${secs} s = ?`,
      answer,
      options: buildNumberOptions(answer),
      hint: `Multiplica ${speed} metros × ${secs} segundos.`,
    };
  }

  const op = Math.random() > 0.45 ? '+' : '-';
  const a = op === '+' ? randInt(6, 13) : randInt(11, 20);
  const b = op === '+' ? randInt(4, 9) : randInt(3, 9);
  const answer = op === '+' ? a + b : a - b;
  return {
    id,
    category: 'arithmetic',
    prompt: `${a} ${op} ${b} = ?`,
    shortExpr: `${a} ${op} ${b} = ?`,
    answer,
    options: buildNumberOptions(answer),
    hint: op === '+' ? `Suma ${a} + ${b}.` : `Resta ${b} a ${a}.`,
  };
}

/**
 * Nivel 3: 4 retos únicos de Plano Cartesiano en el mundo 3D de Mario Wonder.
 */
export function generateCartesianChallenges(): CartesianChallenge[] {
  const items = [
    'Flor Maravilla',
    'Estrella Dorada',
    'Cristal Cósmico',
    'Corona Real',
  ];

  // Elegir 4 coordenadas distintas en cuadrícula 0..5 x 0..5 (evitando (0,0))
  const candidates: { x: number; y: number }[] = [];
  for (let x = 0; x <= 5; x++) {
    for (let y = 0; y <= 5; y++) {
      if (x === 0 && y === 0) continue;
      candidates.push({ x, y });
    }
  }
  const picked = shuffle(candidates).slice(0, 4);

  return picked.map((coord, idx) => ({
    id: `cart-${idx}-${Date.now()}`,
    targetX: coord.x,
    targetY: coord.y,
    itemLabel: items[idx],
    hint: `En (${coord.x}, ${coord.y}): avanza ${coord.x} paso${coord.x === 1 ? '' : 's'} en el eje X (rojo →) y ${coord.y} paso${coord.y === 1 ? '' : 's'} en el eje Y (azul ↑).`,
  }));
}

/**
 * Nivel 4: Situaciones del Búho Mentor sobre probabilidad ("¿Es probable que pase esto?").
 */
export function generateOwlProbabilityScenarios(): [ProbabilityScenario, ProbabilityScenario] {
  const bagPool: ProbabilityScenario[] = [
    {
      id: 'bag-apples',
      situation:
        'En una mochila mágica guardaste 8 manzanas rojas y solo 1 manzana verde. Metes la mano sin mirar.',
      question: '¿Qué tan probable es que saques una manzana roja?',
      options: [
        {
          label: 'Es muy probable que saque una manzana roja',
          isCorrect: true,
          explanation:
            '¡Exacto! Como hay 8 rojas de 9 frutas en total (8/9), es muy probable sacar roja.',
        },
        {
          label: 'Es poco probable que saque una manzana roja',
          isCorrect: false,
          explanation:
            '¡Cuidado! Hay muchísimas más rojas (8) que verdes (1), así que roja es lo más probable.',
        },
        {
          label: 'Es imposible sacar una manzana verde',
          isCorrect: false,
          explanation:
            'Sí hay 1 manzana verde dentro, así que es poco probable (1 de 9), pero no imposible.',
        },
      ],
    },
    {
      id: 'bag-stars',
      situation:
        'Un cofre tiene 9 estrellas doradas y 1 estrella gris. Sacas una estrella al azar.',
      question: '¿Qué dirías que es más probable que pase?',
      options: [
        {
          label: 'Es muy probable que pase: saldrá una estrella dorada',
          isCorrect: true,
          explanation:
            '¡Correcto! 9 de cada 10 estrellas son doradas, así que su probabilidad es altísima.',
        },
        {
          label: 'Es más probable que salga la estrella gris',
          isCorrect: false,
          explanation:
            'Solo hay 1 estrella gris frente a 9 doradas; la gris tiene apenas 1/10 de probabilidad.',
        },
        {
          label: 'Es imposible sacar una estrella dorada',
          isCorrect: false,
          explanation:
            'Al contrario: casi todas son doradas, así que sacar una dorada es muy probable.',
        },
      ],
    },
  ];

  const worldPool: ProbabilityScenario[] = [
    {
      id: 'weather-rain',
      situation:
        'Sales al jardín y ves el cielo cubierto de nubes muy oscuras, viento fuerte y relámpagos.',
      question: 'Observando la situación, ¿qué es probable que pase?',
      options: [
        {
          label: 'Es muy probable que llueva pronto',
          isCorrect: true,
          explanation:
            '¡Muy bien! En la vida diaria también usamos la probabilidad observando las pistas del entorno.',
        },
        {
          label: 'Es imposible que caiga una gota de agua',
          isCorrect: false,
          explanation:
            'Con nubes de tormenta y relámpagos, la lluvia es precisamente el evento más probable.',
        },
        {
          label: 'Es seguro que caerá nieve en una playa tropical',
          isCorrect: false,
          explanation:
            'Eso sería prácticamente imposible bajo esas condiciones; ¡llover es lo probable!',
        },
      ],
    },
    {
      id: 'coin-flip',
      situation:
        'Tienes una moneda justa con Cara de un lado y Sello del otro, y la lanzas al aire.',
      question: '¿Cómo es la probabilidad de que salga Cara o Sello?',
      options: [
        {
          label: 'Es igual de probable (50% Cara y 50% Sello)',
          isCorrect: true,
          explanation:
            '¡Genial! Como solo hay 2 lados iguales, ambos tienen exactamente la misma probabilidad (1/2).',
        },
        {
          label: 'Es seguro que siempre salga Cara',
          isCorrect: false,
          explanation:
            'Como también existe el lado Sello, nunca es 100% seguro que salga Cara.',
        },
        {
          label: 'Es imposible que caiga Sello',
          isCorrect: false,
          explanation:
            'El Sello tiene exactamente la misma oportunidad (1 de 2) que la Cara.',
        },
      ],
    },
  ];

  const first = bagPool[randInt(0, bagPool.length - 1)];
  const second = worldPool[randInt(0, worldPool.length - 1)];

  return [
    { ...first, options: shuffle(first.options) },
    { ...second, options: shuffle(second.options) },
  ];
}

export function buildOwlReflectionReply(
  favoriteLevel: string,
  reflectionText: string,
  stats: PlayerStats
): string {
  const cleanText = reflectionText.trim();
  const lower = cleanText.toLowerCase();

  let strategyPraise =
    '¡Qué excelente reflexión! Comprender proporciones, probabilidad y coordenadas convierte tu mente en una brújula matemática.';

  if (lower.includes('x') || lower.includes('y') || lower.includes('coordenad') || lower.includes('plano')) {
    strategyPraise =
      '¡Dominaste el Plano Cartesiano! Recordar que el primer número avanza en el eje X y el segundo en el eje Y es la clave de mapas y videojuegos.';
  } else if (lower.includes('probab') || lower.includes('posib') || lower.includes('proporc') || lower.includes('mayor')) {
    strategyPraise =
      '¡Pensamiento estadístico de maestro! Comparar cuántas opciones hay a favor frente al total te permite predecir qué es más probable.';
  } else if (lower.includes('aliad') || lower.includes('escud') || lower.includes('multi')) {
    strategyPraise =
      '¡Gran trabajo en equipo y cálculo! Elegir aliados para protegerte mientras aplicas proporciones demuestra estrategia y agilidad.';
  }

  const levelNote = favoriteLevel
    ? ` Me alegra mucho que hayas disfrutado "${favoriteLevel}".`
    : '';

  const accuracy =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)
      : 100;

  return `${strategyPraise}${levelNote} Con ${stats.coins} monedas acumuladas y ${accuracy}% de precisión, ¡recibe tu Medalla Oficial de MateAventura 3D!`;
}
