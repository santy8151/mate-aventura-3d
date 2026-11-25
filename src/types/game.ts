export type LevelNumber = 1 | 2 | 3 | 4;

export type GameScreen = 'welcome' | 'playing' | 'level-complete' | 'game-over';

export type LaneIndex = 0 | 1 | 2; // 0 = Izquierda, 1 = Centro, 2 = Derecha

export interface MathProblem {
  id: string;
  a: number;
  b: number;
  op: '+' | '-';
  answer: number;
  options: number[];
  text: string;
  hint: string;
}

export interface PlayerStats {
  heroName: string;
  coins: number;
  totalCorrect: number;
  totalWrong: number;
  streak: number;
  bestStreak: number;
  favoriteLevel: string;
  reflectionText: string;
}

export interface BattleVisualState {
  round: number;
  villainHp: number;
  maxVillainHp: number;
  event: 'idle' | 'hero-attack' | 'villain-attack' | 'villain-defeated';
  eventTick: number;
}

export interface RaceVisualState {
  lane: LaneIndex;
  gateProgress: number; // 0 to 3
  totalGates: number;
  portalDistance: number; // 1 (far horizon) -> 0 (at player)
  portalOptions: [number, number, number];
  correctLane: LaneIndex;
  event: 'driving' | 'turbo' | 'crash' | 'finish';
  eventTick: number;
  turboActive: boolean;
}

export interface PlatformVisualState {
  stageIndex: number; // 0..3 (4 problemas)
  totalStages: number; // 4
  jumpCount: number;
  targetAnswer: number;
  evolutionTier: number; // 0 = normal, 1 = poder rojo, 2 = capa, 3 = aura estrella, 4 = corona real
  evolved: boolean;
  event: 'idle' | 'jump' | 'bump-fail' | 'advance' | 'evolve';
  eventTick: number;
}

export interface OwlVisualState {
  step: 'summary' | 'q1' | 'q2' | 'certificate';
  event: 'idle' | 'talk' | 'happy' | 'trophy';
  eventTick: number;
}
