export type LevelNumber = 1 | 2 | 3 | 4;

export type GameScreen = 'welcome' | 'playing' | 'level-complete' | 'game-over';

export type LaneIndex = 0 | 1 | 2; // 0 = Izquierda, 1 = Centro, 2 = Derecha

export type AllyId = 'dino' | 'princess' | 'toad';

export interface MathProblem {
  id: string;
  category: 'proportions' | 'probability' | 'arithmetic';
  prompt: string;
  shortExpr: string;
  answer: number | string;
  options: (number | string)[];
  hint: string;
  visualBadge?: string;
}

export interface CartesianChallenge {
  id: string;
  targetX: number; // 0..5
  targetY: number; // 0..5
  itemLabel: string;
  hint: string;
}

export interface ProbabilityScenario {
  id: string;
  situation: string;
  question: string;
  options: {
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
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
  activeAlly: AllyId;
  shieldActive: boolean;
  event:
    | 'idle'
    | 'ally-summon'
    | 'hero-attack'
    | 'ally-block'
    | 'villain-attack'
    | 'villain-defeated';
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
  stageIndex: number; // 0..3 (4 retos en Plano Cartesiano)
  totalStages: number; // 4
  heroX: number; // 0..5
  heroY: number; // 0..5
  targetX: number; // 0..5
  targetY: number; // 0..5
  foundCoords: { x: number; y: number }[];
  evolutionTier: number; // 0..4
  evolved: boolean;
  event: 'idle' | 'hop' | 'bump-fail' | 'discover' | 'evolve';
  eventTick: number;
}

export interface OwlVisualState {
  step: 'summary' | 'prob1' | 'prob2' | 'q1' | 'q2' | 'certificate';
  event: 'idle' | 'talk' | 'happy' | 'trophy';
  eventTick: number;
}
