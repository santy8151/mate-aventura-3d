import React from 'react';
import { Coins, Compass, Flame, Heart, RotateCcw, Sparkles, Swords, Car, GraduationCap, Volume2, VolumeX } from 'lucide-react';
import type { LevelNumber } from '../types/game';

interface HUDProps {
  level: LevelNumber;
  levelProgress: number; // 0..1 within current level
  lives: number;
  maxLives: number;
  coins: number;
  streak: number;
  muted: boolean;
  onRestartLevel: () => void;
  onToggleMute: () => void;
}

const LEVELS: { num: LevelNumber; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { num: 1, label: 'Batalla', Icon: Swords },
  { num: 2, label: 'Carrera', Icon: Car },
  { num: 3, label: 'Plano (X,Y)', Icon: Compass },
  { num: 4, label: 'Búho', Icon: GraduationCap },
];

export const HUD: React.FC<HUDProps> = ({
  level,
  levelProgress,
  lives,
  maxLives,
  coins,
  streak,
  muted,
  onRestartLevel,
  onToggleMute,
}) => {
  // Progreso global del 0 al 100% a través de los 4 niveles
  const overallPercent = Math.min(
    100,
    Math.round(((level - 1 + Math.min(1, Math.max(0, levelProgress))) / 4) * 100)
  );

  return (
    <header className="no-print pointer-events-none absolute top-0 left-0 right-0 z-30 p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-3xl bg-white/90 backdrop-blur-md border-2 border-white shadow-[0_6px_0_rgba(15,23,42,0.12)] px-3 py-2.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5">
        {/* Vidas (3 Corazones) */}
        <div
          className="flex items-center gap-1.5 bg-rose-50 border-2 border-rose-200 rounded-2xl px-2.5 py-1.5"
          aria-label={`Vidas: ${lives} de ${maxLives}`}
        >
          {Array.from({ length: maxLives }).map((_, idx) => {
            const active = idx < lives;
            return (
              <Heart
                key={idx}
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                  active
                    ? 'fill-rose-500 text-rose-600 scale-100 drop-shadow-sm'
                    : 'fill-slate-200 text-slate-300 scale-90'
                }`}
              />
            );
          })}
        </div>

        {/* Barra de Progreso Superior (Nivel 1 al 4) */}
        <div className="flex-1 min-w-[200px] max-w-md mx-auto">
          <div className="flex items-center justify-between mb-1 px-1">
            {LEVELS.map(({ num, label, Icon }) => {
              const isDone = level > num;
              const isCurrent = level === num;
              return (
                <div
                  key={num}
                  className={`flex items-center gap-1 text-[11px] sm:text-xs font-extrabold transition-all ${
                    isCurrent
                      ? 'text-sky-700 scale-105'
                      : isDone
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      isCurrent
                        ? 'bg-sky-500 border-sky-600 text-white shadow-sm'
                        : isDone
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'bg-slate-100 border-slate-300 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              );
            })}
          </div>
          <div className="h-3.5 w-full rounded-full bg-slate-200 border border-slate-300 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-amber-400 transition-all duration-500 ease-out relative"
              style={{ width: `${Math.max(6, overallPercent)}%` }}
            >
              <div className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/45" />
            </div>
          </div>
        </div>

        {/* Monedas, Racha y Botones de Control */}
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <div
              className="hidden md:flex items-center gap-1 bg-orange-100 border-2 border-orange-300 text-orange-700 rounded-2xl px-2.5 py-1 text-xs font-black animate-pop-in"
              title="Racha de aciertos"
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
              <span>x{streak}</span>
            </div>
          )}

          <div
            className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-300 text-amber-800 rounded-2xl px-3 py-1.5 font-black text-sm sm:text-base shadow-inner"
            aria-label={`Monedas acumuladas: ${coins}`}
          >
            <Coins className="w-5 h-5 text-amber-500" />
            <span>{coins}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />
          </div>

          <button
            type="button"
            onClick={onRestartLevel}
            title="Reiniciar nivel actual"
            className="btn-toy flex items-center gap-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 border-2 border-sky-300 border-b-4 rounded-2xl px-2.5 py-1.5 text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Reiniciar</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            title={muted ? 'Activar sonido' : 'Silenciar sonido'}
            className="btn-toy flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 border-b-4 rounded-2xl p-1.5 sm:p-2 cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
