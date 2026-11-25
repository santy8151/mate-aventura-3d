import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Flag, Gauge, Zap } from 'lucide-react';
import type { LaneIndex, MathProblem } from '../types/game';

interface Level2RaceUIProps {
  problem: MathProblem;
  lane: LaneIndex;
  gateProgress: number;
  totalGates: number;
  portalDistance: number;
  feedback: { type: 'good' | 'bad'; text: string } | null;
  onChangeLane: (lane: LaneIndex) => void;
  onShiftLane: (delta: -1 | 1) => void;
  onBoostApproach: () => void;
}

const LANE_LABELS: readonly string[] = ['Izquierda', 'Centro', 'Derecha'];

export const Level2RaceUI: React.FC<Level2RaceUIProps> = ({
  problem,
  lane,
  gateProgress,
  totalGates,
  portalDistance,
  feedback,
  onChangeLane,
  onShiftLane,
  onBoostApproach,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const lower = key.toLowerCase();

      if (key === 'ArrowLeft' || lower === 'a') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onShiftLane(-1);
      } else if (key === 'ArrowRight' || lower === 'd') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onShiftLane(1);
      } else if (key === '1') {
        onChangeLane(0);
      } else if (key === '2') {
        onChangeLane(1);
      } else if (key === '3') {
        onChangeLane(2);
      } else if (e.code === 'Space' || key === 'ArrowUp' || lower === 'w') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onBoostApproach();
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onShiftLane, onChangeLane, onBoostApproach]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-20 pb-3 px-3 sm:px-6">
      <div className="mx-auto w-full max-w-3xl flex flex-col items-center gap-2">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="pointer-events-auto rounded-2xl bg-rose-600/90 backdrop-blur text-white border-2 border-rose-300 px-3.5 py-1.5 text-xs sm:text-sm font-black shadow-md flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-300" />
            <span>
              Nivel 2: Carrera Matemática (Portal {Math.min(totalGates, gateProgress + 1)}/{totalGates})
            </span>
          </div>

          <div className="pointer-events-auto rounded-2xl bg-slate-900/85 backdrop-blur text-white border-2 border-slate-700 px-3 py-1.5 text-xs font-extrabold flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-400" />
            <span>Portal:</span>
            <div className="w-20 h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-100"
                style={{ width: `${Math.round((1 - portalDistance) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pointer-events-auto rounded-3xl bg-white/95 border-4 border-amber-400 shadow-[0_8px_0_rgba(15,23,42,0.18)] px-6 py-2 text-center animate-pop-in">
          <div className="text-[11px] font-black uppercase tracking-wider text-rose-600">
            {problem.category === 'proportions'
              ? problem.prompt
              : '¡Mueve el kart con las flechas ← → al resultado correcto!'}
          </div>
          <div className="font-display text-3xl sm:text-5xl font-bold text-slate-900">
            {problem.shortExpr}
          </div>
        </div>

        {feedback && (
          <div
            className={`pointer-events-auto rounded-2xl px-4 py-1.5 text-sm sm:text-base font-black border-2 shadow-lg animate-pop-in ${
              feedback.type === 'good'
                ? 'bg-emerald-500 border-emerald-200 text-white'
                : 'bg-rose-500 border-rose-200 text-white animate-shake-gentle'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <div className="pointer-events-auto rounded-[1.5rem] bg-white/90 backdrop-blur-md border-4 border-white shadow-[0_8px_0_rgba(15,23,42,0.15)] px-3 py-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={lane === 0}
              onClick={() => onShiftLane(-1)}
              className="btn-toy flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 text-white border-2 border-sky-700 border-b-[5px] py-2 font-extrabold text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Izquierda (←)</span>
            </button>

            <button
              type="button"
              onClick={onBoostApproach}
              title="Acelerar hacia el portal (Espacio o ↑)"
              className="btn-toy flex items-center justify-center gap-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-600 border-b-[5px] px-4 py-2 font-black text-xs sm:text-sm cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-amber-900" />
              <span>¡Acelerar!</span>
            </button>

            <button
              type="button"
              disabled={lane === 2}
              onClick={() => onShiftLane(1)}
              className="btn-toy flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 text-white border-2 border-sky-700 border-b-[5px] py-2 font-extrabold text-sm cursor-pointer"
            >
              <span>Derecha (→)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([0, 1, 2] as LaneIndex[]).map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeLane(idx)}
                className={`rounded-xl py-1 text-xs font-black border-2 transition-all cursor-pointer ${
                  lane === idx
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                }`}
              >
                Carril {idx + 1}: {LANE_LABELS[idx]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
