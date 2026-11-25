import React, { useEffect } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Compass,
  Crown,
} from 'lucide-react';
import type { CartesianChallenge } from '../types/game';

interface Level3PlatformUIProps {
  challenge: CartesianChallenge;
  stageIndex: number;
  totalStages: number;
  evolutionTier: number;
  heroX: number;
  heroY: number;
  evolved: boolean;
  locked: boolean;
  headAnchorRef: React.RefObject<HTMLDivElement | null>;
  feedback: { type: 'good' | 'bad'; text: string } | null;
  onMove: (dx: number, dy: number) => void;
  onConfirmCoord: () => void;
  onProceedToLevel4: () => void;
}

const TIER_NAMES = ['Aventurero', 'Poder Rojo', 'Capa Wonder', 'Aura Estelar', 'Rey Coronado'];

export const Level3PlatformUI: React.FC<Level3PlatformUIProps> = ({
  challenge,
  stageIndex,
  totalStages,
  evolutionTier,
  heroX,
  heroY,
  evolved,
  locked,
  headAnchorRef,
  feedback,
  onMove,
  onConfirmCoord,
  onProceedToLevel4,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (evolved) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onProceedToLevel4();
        }
        return;
      }
      if (locked) return;

      const key = e.key;
      const lower = key.toLowerCase();
      if (key === 'ArrowLeft' || lower === 'a') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onMove(-1, 0);
      } else if (key === 'ArrowRight' || lower === 'd') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onMove(1, 0);
      } else if (key === 'ArrowUp' || lower === 'w') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onMove(0, 1);
      } else if (key === 'ArrowDown' || lower === 's') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onMove(0, -1);
      } else if (key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onConfirmCoord();
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [evolved, locked, onMove, onConfirmCoord, onProceedToLevel4]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-20 pb-3 px-3 sm:px-6">
      {/* Etiqueta flotante en tiempo real sobre el personaje 3D mostrando su coordenada (X, Y) */}
      {!evolved && (
        <div
          ref={headAnchorRef}
          style={{ left: '30%', top: '55%' }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full transition-transform duration-75"
        >
          <div className="flex flex-col items-center">
            <div className="rounded-2xl px-3 py-0.5 border-3 shadow-md font-display text-sm sm:text-base font-bold bg-white border-sky-500 text-slate-900 whitespace-nowrap">
              (<span className="text-rose-600">{heroX}</span>,{' '}
              <span className="text-sky-600">{heroY}</span>)
            </div>
            <div className="w-2.5 h-2.5 rotate-45 -mt-1.5 border-r-3 border-b-3 bg-white border-sky-500" />
          </div>
        </div>
      )}

      {/* Encabezado Superior: Reto de Plano Cartesiano */}
      <div className="mx-auto w-full max-w-3xl flex flex-col items-center gap-1.5">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="pointer-events-auto rounded-2xl bg-amber-500/95 text-white border-2 border-amber-200 px-3.5 py-1.5 text-xs sm:text-sm font-black shadow-md flex items-center gap-2">
            <Compass className="w-4 h-4 text-yellow-100" />
            <span>
              Nivel 3: Plano Cartesiano Mario ({Math.min(totalStages, stageIndex + 1)}/{totalStages})
            </span>
          </div>

          <div className="pointer-events-auto rounded-2xl bg-purple-700/90 text-white border-2 border-purple-300 px-3.5 py-1.5 text-xs font-black shadow-md flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Forma: {TIER_NAMES[Math.min(4, evolutionTier)]}</span>
          </div>
        </div>

        {!evolved && (
          <div className="pointer-events-auto rounded-3xl bg-white/95 border-4 border-amber-400 shadow-[0_6px_0_rgba(15,23,42,0.16)] px-5 py-2 text-center">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">
              Encuentra: {challenge.itemLabel} — Mueve al héroe o haz clic en la casilla 3D
            </p>
            <div className="mt-0.5 flex items-center justify-center gap-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              <span>Coordenada:</span>
              <span className="rounded-2xl bg-slate-900 text-white px-4 py-0.5">
                (<span className="text-rose-400">X={challenge.targetX}</span>,{' '}
                <span className="text-sky-400">Y={challenge.targetY}</span>)
              </span>
            </div>
          </div>
        )}

        {feedback && (
          <div
            className={`pointer-events-auto rounded-2xl px-4 py-1.5 text-xs sm:text-sm font-black border-2 shadow-lg animate-pop-in ${
              feedback.type === 'good'
                ? 'bg-emerald-500 border-emerald-200 text-white'
                : 'bg-rose-500 border-rose-200 text-white animate-shake-gentle'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Controles inferiores compactos de movimiento y confirmación */}
      <div className="mx-auto w-full max-w-2xl">
        {!evolved ? (
          <div className="pointer-events-auto rounded-[1.5rem] bg-white/92 backdrop-blur-md border-4 border-white shadow-[0_8px_0_rgba(15,23,42,0.15)] px-3 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
            {/* Cruceta direccional X / Y */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={locked || heroX <= 0}
                onClick={() => onMove(-1, 0)}
                title="Eje X - 1 (←)"
                className="btn-toy rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-slate-200 disabled:text-slate-400 text-white border-2 border-rose-700 border-b-4 px-2.5 py-2 font-black text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>X-1</span>
              </button>
              <button
                type="button"
                disabled={locked || heroX >= 5}
                onClick={() => onMove(1, 0)}
                title="Eje X + 1 (→)"
                className="btn-toy rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-slate-200 disabled:text-slate-400 text-white border-2 border-rose-700 border-b-4 px-2.5 py-2 font-black text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>X+1</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={locked || heroY >= 5}
                onClick={() => onMove(0, 1)}
                title="Eje Y + 1 (↑)"
                className="btn-toy rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-200 disabled:text-slate-400 text-white border-2 border-sky-700 border-b-4 px-2.5 py-2 font-black text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Y+1</span>
              </button>
              <button
                type="button"
                disabled={locked || heroY <= 0}
                onClick={() => onMove(0, -1)}
                title="Eje Y - 1 (↓)"
                className="btn-toy rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-200 disabled:text-slate-400 text-white border-2 border-sky-700 border-b-4 px-2.5 py-2 font-black text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowDown className="w-4 h-4" />
                <span>Y-1</span>
              </button>
            </div>

            <div className="text-xs font-extrabold text-slate-600 hidden sm:block">
              Estás en:{' '}
              <span className="font-black text-slate-900">
                ({heroX}, {heroY})
              </span>
            </div>

            <button
              type="button"
              disabled={locked}
              onClick={onConfirmCoord}
              className="btn-toy flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white border-2 border-emerald-700 border-b-[5px] px-5 py-2 font-display text-base sm:text-lg font-bold shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Confirmar ({heroX}, {heroY})!</span>
            </button>
          </div>
        ) : (
          <div className="pointer-events-auto rounded-[1.75rem] bg-gradient-to-r from-amber-50 to-purple-50 border-4 border-amber-300 shadow-[0_8px_0_rgba(15,23,42,0.16)] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pop-in">
            <div>
              <div className="flex items-center gap-1.5 text-purple-700 font-black text-xs uppercase tracking-wider">
                <Crown className="w-4 h-4 fill-amber-400 text-amber-600" />
                <span>¡Maestro del Plano Cartesiano!</span>
              </div>
              <p className="font-display text-lg sm:text-2xl font-bold text-slate-900">
                ¡Encontraste los {totalStages} tesoros Wonder y evolucionaste a Rey Coronado!
              </p>
            </div>

            <button
              type="button"
              onClick={onProceedToLevel4}
              className="btn-toy shrink-0 flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white border-2 border-purple-800 border-b-[6px] px-6 py-3 font-display text-lg font-bold shadow-lg cursor-pointer"
            >
              <span>Ir con el Búho Mentor</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
