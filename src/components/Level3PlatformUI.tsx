import React, { useEffect } from 'react';
import { ArrowRight, ArrowUp, CheckCircle2, Crown, RotateCcw, Sparkles } from 'lucide-react';
import type { MathProblem } from '../types/game';

interface Level3PlatformUIProps {
  problem: MathProblem;
  stageIndex: number;
  totalStages: number;
  evolutionTier: number;
  jumpCount: number;
  evolved: boolean;
  locked: boolean;
  headAnchorRef: React.RefObject<HTMLDivElement | null>;
  feedback: { type: 'good' | 'bad'; text: string } | null;
  onJump: () => void;
  onResetCount: () => void;
  onConfirmCount: () => void;
  onProceedToLevel4: () => void;
}

const TIER_NAMES = ['Aventurero', 'Poder Rojo', 'Capa Heroica', 'Aura Estelar', 'Rey Coronado'];

export const Level3PlatformUI: React.FC<Level3PlatformUIProps> = ({
  problem,
  stageIndex,
  totalStages,
  evolutionTier,
  jumpCount,
  evolved,
  locked,
  headAnchorRef,
  feedback,
  onJump,
  onResetCount,
  onConfirmCount,
  onProceedToLevel4,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (evolved) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onProceedToLevel4();
        }
        return;
      }

      if (locked) return;

      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onJump();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onConfirmCount();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onResetCount();
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [evolved, locked, onJump, onConfirmCount, onResetCount, onProceedToLevel4]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-20 pb-3 px-3 sm:px-6">
      {/* Contador flotante en tiempo real sobre el personaje 3D */}
      {!evolved && !locked && (
        <div
          ref={headAnchorRef}
          style={{ left: '42%', top: '38%' }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full transition-transform duration-75"
        >
          <div key={jumpCount} className="flex flex-col items-center animate-bounce-counter">
            <div className="rounded-2xl px-4 py-1 border-4 shadow-lg font-display text-2xl sm:text-3xl font-bold flex items-center gap-1.5 bg-white border-sky-500 text-slate-900">
              <span>{jumpCount}</span>
            </div>
            <div className="w-3 h-3 rotate-45 -mt-1.5 border-r-4 border-b-4 bg-white border-sky-500" />
          </div>
        </div>
      )}

      {/* Parte superior: Progreso de 4 bloques y Operación */}
      <div className="mx-auto w-full max-w-3xl flex flex-col items-center gap-1.5">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="pointer-events-auto rounded-2xl bg-amber-500/95 text-white border-2 border-amber-200 px-3.5 py-1.5 text-xs sm:text-sm font-black shadow-md flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>
              Nivel 3: Mundo Mario ({Math.min(totalStages, stageIndex + 1)}/{totalStages})
            </span>
          </div>

          <div className="pointer-events-auto rounded-2xl bg-purple-700/90 text-white border-2 border-purple-300 px-3.5 py-1.5 text-xs font-black shadow-md flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Forma: {TIER_NAMES[Math.min(4, evolutionTier)]}</span>
          </div>
        </div>

        {!evolved && (
          <div className="pointer-events-auto rounded-3xl bg-white/95 border-4 border-amber-400 shadow-[0_6px_0_rgba(15,23,42,0.16)] px-6 py-2 text-center">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">
              Bloque Misterioso {stageIndex + 1} de {totalStages} — ¡Salta exactamente el resultado!
            </p>
            <div className="font-display text-2xl sm:text-4xl font-bold text-slate-900">
              {problem.text}
            </div>
          </div>
        )}

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

      {/* Controles inferiores */}
      <div className="mx-auto w-full max-w-2xl">
        {!evolved ? (
          <div className="pointer-events-auto rounded-[1.75rem] bg-white/94 backdrop-blur-md border-4 border-white shadow-[0_8px_0_rgba(15,23,42,0.15)] p-3 sm:p-4 flex flex-col gap-2">
            <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2.5">
              <button
                type="button"
                disabled={locked}
                onClick={onJump}
                className="btn-toy flex-[2] flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white border-2 border-emerald-700 border-b-[6px] py-3 px-5 font-display text-xl sm:text-2xl font-bold shadow-md cursor-pointer"
              >
                <ArrowUp className="w-6 h-6 stroke-[3]" />
                <span>¡SALTAR!</span>
                <span className="rounded-xl bg-emerald-700/60 px-2.5 py-0.5 text-base font-black">
                  {jumpCount}
                </span>
              </button>

              <button
                type="button"
                disabled={locked}
                onClick={onResetCount}
                title="Volver el conteo a 0 (Backspace)"
                className="btn-toy flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 border-b-[6px] px-4 py-2.5 font-extrabold text-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Cero</span>
              </button>

              <button
                type="button"
                disabled={locked || jumpCount === 0}
                onClick={onConfirmCount}
                className="btn-toy flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 text-amber-950 border-2 border-amber-600 border-b-[6px] py-3 px-5 font-display text-lg sm:text-xl font-bold shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>¡Confirmar!</span>
              </button>
            </div>

            <p className="text-center text-[11px] font-bold text-slate-500">
              Presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-200 font-black">Espacio</kbd> o el botón
              verde para saltar • <kbd className="px-1.5 py-0.5 rounded bg-slate-200 font-black">Enter</kbd> para confirmar
            </p>
          </div>
        ) : (
          <div className="pointer-events-auto rounded-[1.75rem] bg-gradient-to-r from-amber-50 to-purple-50 border-4 border-amber-300 shadow-[0_8px_0_rgba(15,23,42,0.16)] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pop-in">
            <div>
              <div className="flex items-center gap-1.5 text-purple-700 font-black text-xs uppercase tracking-wider">
                <Crown className="w-4 h-4 fill-amber-400 text-amber-600" />
                <span>¡Evolución Superhéroe Real!</span>
              </div>
              <p className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                ¡Completaste los {totalStages} bloques del Mundo Mario y alcanzaste la Bandera Meta!
              </p>
            </div>

            <button
              type="button"
              onClick={onProceedToLevel4}
              className="btn-toy shrink-0 flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white border-2 border-purple-800 border-b-[6px] px-6 py-3.5 font-display text-lg font-bold shadow-lg cursor-pointer"
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
