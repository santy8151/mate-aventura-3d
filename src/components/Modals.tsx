import React from 'react';
import { ArrowRight, Coins, HeartCrack, RotateCcw, Trophy } from 'lucide-react';
import type { LevelNumber } from '../types/game';

interface LevelCompleteModalProps {
  completedLevel: LevelNumber;
  coins: number;
  onNextLevel: () => void;
}

const LEVEL_TITLES: Record<LevelNumber, string> = {
  1: '¡Derrotaste al Titán Caos-X con tus Aliados!',
  2: '¡Cruzaste la Meta a Todo Turbo!',
  3: '¡Dominaste el Plano Cartesiano Mario!',
  4: '¡Completaste toda MateAventura 3D!',
};

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  completedLevel,
  coins,
  onNextLevel,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white border-4 border-amber-300 shadow-[0_14px_0_rgba(15,23,42,0.22)] p-6 text-center animate-pop-in">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-400 border-4 border-amber-200 flex items-center justify-center shadow-md mb-3">
          <Trophy className="w-9 h-9 text-amber-950" />
        </div>

        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
          Nivel {completedLevel} Completado
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          {LEVEL_TITLES[completedLevel]}
        </h2>

        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-2 text-amber-900 font-black">
          <Coins className="w-5 h-5 text-amber-500" />
          <span>Monedas acumuladas: {coins}</span>
        </div>

        <button
          type="button"
          onClick={onNextLevel}
          className="btn-toy mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-emerald-700 border-b-[6px] py-3.5 font-display text-xl font-bold cursor-pointer"
        >
          <span>Continuar al Nivel {completedLevel + 1}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  level: LevelNumber;
  onRetryLevel: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ level, onRetryLevel }) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white border-4 border-rose-300 shadow-[0_14px_0_rgba(15,23,42,0.22)] p-6 text-center animate-pop-in">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-rose-100 border-4 border-rose-200 flex items-center justify-center mb-3">
          <HeartCrack className="w-9 h-9 text-rose-500" />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          ¡Se agotaron las vidas!
        </h2>
        <p className="mt-2 text-sm font-bold text-slate-600">
          ¡No pasa nada! Cada intento hace tu mente más fuerte. Intenta el Nivel {level} de nuevo con
          3 corazones nuevos.
        </p>

        <button
          type="button"
          onClick={onRetryLevel}
          className="btn-toy mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white border-2 border-sky-700 border-b-[6px] py-3.5 font-display text-xl font-bold cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reintentar Nivel {level}</span>
        </button>
      </div>
    </div>
  );
};
