import React, { useEffect } from 'react';
import { ShieldAlert, Sparkles, Zap } from 'lucide-react';
import type { MathProblem } from '../types/game';

interface Level1BattleUIProps {
  problem: MathProblem;
  round: number;
  maxRounds: number;
  villainHp: number;
  maxVillainHp: number;
  wrongChoices: number[];
  feedback: { type: 'good' | 'bad'; text: string } | null;
  locked: boolean;
  onSelectAnswer: (choice: number) => void;
}

export const Level1BattleUI: React.FC<Level1BattleUIProps> = ({
  problem,
  round,
  maxRounds,
  villainHp,
  maxVillainHp,
  wrongChoices,
  feedback,
  locked,
  onSelectAnswer,
}) => {
  // Soporte de teclado: teclas 1, 2, 3 para elegir rápidamente
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (locked) return;
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = Number(e.key) - 1;
        const val = problem.options[idx];
        if (val !== undefined && !wrongChoices.includes(val)) {
          onSelectAnswer(val);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [problem, wrongChoices, locked, onSelectAnswer]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-20 pb-4 px-3 sm:px-6">
      {/* Barra superior del Nivel 1: Vida del Villano */}
      <div className="mx-auto w-full max-w-3xl flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto rounded-2xl bg-sky-600/90 backdrop-blur text-white border-2 border-sky-300 px-3.5 py-1.5 text-xs sm:text-sm font-black shadow-md flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Nivel 1: Batalla de Superhéroes ({round + 1}/{maxRounds})</span>
        </div>

        <div className="pointer-events-auto rounded-2xl bg-purple-900/90 backdrop-blur text-white border-2 border-purple-400 px-3.5 py-1.5 shadow-md flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-purple-300" />
          <span className="text-xs font-black">Dr. Glitcheo:</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: maxVillainHp }).map((_, i) => (
              <span
                key={i}
                className={`h-3 w-7 rounded-full border transition-all duration-300 ${
                  i < villainHp
                    ? 'bg-fuchsia-400 border-fuchsia-200 shadow-[0_0_8px_rgba(232,121,249,0.7)]'
                    : 'bg-purple-950 border-purple-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Zona inferior de pregunta y 3 opciones */}
      <div className="mx-auto w-full max-w-2xl flex flex-col items-center gap-2.5">
        {feedback && (
          <div
            className={`pointer-events-auto rounded-2xl px-4 py-2 text-sm sm:text-base font-black shadow-lg border-2 animate-pop-in ${
              feedback.type === 'good'
                ? 'bg-emerald-500 border-emerald-200 text-white'
                : 'bg-amber-100 border-amber-400 text-amber-950 animate-shake-gentle'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="pointer-events-auto w-full rounded-[1.75rem] bg-white/94 backdrop-blur-md border-4 border-white shadow-[0_10px_0_rgba(15,23,42,0.16)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
              ¡Elige la respuesta correcta para atacar!
            </span>
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
              Atajo de teclado: teclas 1, 2 o 3
            </span>
          </div>

          <div className="text-center mb-4">
            <div className="inline-block rounded-3xl bg-slate-900 text-white px-7 py-2.5 font-display text-3xl sm:text-5xl font-bold tracking-wide shadow-inner border-2 border-slate-700">
              {problem.text}
            </div>
            {wrongChoices.length > 0 && (
              <p className="mt-2 text-xs sm:text-sm font-extrabold text-amber-700 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{problem.hint}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {problem.options.map((opt, idx) => {
              const isWrong = wrongChoices.includes(opt);
              return (
                <button
                  key={`${problem.id}-${opt}`}
                  type="button"
                  disabled={locked || isWrong}
                  onClick={() => onSelectAnswer(opt)}
                  className={`btn-toy relative rounded-2xl border-2 border-b-[6px] py-3.5 sm:py-4 font-display text-2xl sm:text-4xl font-bold transition-all cursor-pointer ${
                    isWrong
                      ? 'bg-rose-100 border-rose-200 text-rose-300 line-through cursor-not-allowed'
                      : 'bg-sky-500 hover:bg-sky-400 border-sky-700 text-white shadow-md'
                  }`}
                >
                  <span className="absolute top-1.5 left-2.5 text-[11px] font-sans font-black opacity-75">
                    {idx + 1}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
