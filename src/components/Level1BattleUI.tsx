import React, { useEffect } from 'react';
import { Shield, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import type { AllyId, MathProblem } from '../types/game';

interface Level1BattleUIProps {
  problem: MathProblem;
  round: number;
  maxRounds: number;
  villainHp: number;
  maxVillainHp: number;
  activeAlly: AllyId;
  allyShields: Record<AllyId, boolean>;
  wrongChoices: (number | string)[];
  feedback: { type: 'good' | 'bad' | 'shield'; text: string } | null;
  locked: boolean;
  onSelectAlly: (ally: AllyId) => void;
  onSelectAnswer: (choice: number | string) => void;
}

const ALLIES: { id: AllyId; name: string; emoji: string; perk: string }[] = [
  { id: 'dino', name: 'Dino Verde', emoji: '🦕', perk: 'Escudo Hoja' },
  { id: 'princess', name: 'Princesa Estela', emoji: '👑', perk: 'Escudo Mágico' },
  { id: 'toad', name: 'Capitán Champi', emoji: '🍄', perk: 'Escudo Titán' },
];

export const Level1BattleUI: React.FC<Level1BattleUIProps> = ({
  problem,
  round,
  maxRounds,
  villainHp,
  maxVillainHp,
  activeAlly,
  allyShields,
  wrongChoices,
  feedback,
  locked,
  onSelectAlly,
  onSelectAnswer,
}) => {
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
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-20 pb-3 px-3 sm:px-6">
      {/* Barra superior: Estado del Jefe Gigante + Selector de Aliados */}
      <div className="mx-auto w-full max-w-4xl flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="pointer-events-auto rounded-2xl bg-sky-600/92 backdrop-blur text-white border-2 border-sky-300 px-3.5 py-1.5 text-xs sm:text-sm font-black shadow-md flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>
              Nivel 1: Proporciones y Probabilidad ({round + 1}/{maxRounds})
            </span>
          </div>

          <div className="pointer-events-auto rounded-2xl bg-purple-950/92 backdrop-blur text-white border-2 border-purple-400 px-3.5 py-1.5 shadow-md flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-fuchsia-300" />
            <span className="text-xs font-black">Titán Caos-X:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxVillainHp }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-6 rounded-full border transition-all duration-300 ${
                    i < villainHp
                      ? 'bg-fuchsia-400 border-fuchsia-200 shadow-[0_0_8px_rgba(232,121,249,0.75)]'
                      : 'bg-purple-950 border-purple-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Barra de Aliados Protectores */}
        <div className="pointer-events-auto self-start rounded-2xl bg-white/90 backdrop-blur border-2 border-emerald-300 shadow-md px-3 py-1.5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase text-emerald-800 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tu Aliado Defensor:</span>
          </span>
          {ALLIES.map((a) => {
            const isSelected = activeAlly === a.id;
            const hasShield = allyShields[a.id];
            return (
              <button
                key={a.id}
                type="button"
                disabled={locked}
                onClick={() => onSelectAlly(a.id)}
                className={`rounded-xl px-2.5 py-1 text-xs font-extrabold border-2 transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-700 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>{a.emoji}</span>
                <span>{a.name}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    hasShield
                      ? isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-sky-100 text-sky-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {hasShield ? '🛡️ Listo' : 'Usado'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zona inferior de pregunta y 3 opciones */}
      <div className="mx-auto w-full max-w-3xl flex flex-col items-center gap-2">
        {feedback && (
          <div
            className={`pointer-events-auto rounded-2xl px-4 py-1.5 text-xs sm:text-sm font-black shadow-lg border-2 animate-pop-in ${
              feedback.type === 'good'
                ? 'bg-emerald-500 border-emerald-200 text-white'
                : feedback.type === 'shield'
                  ? 'bg-sky-500 border-sky-200 text-white'
                  : 'bg-amber-100 border-amber-400 text-amber-950 animate-shake-gentle'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="pointer-events-auto w-full rounded-[1.75rem] bg-white/94 backdrop-blur-md border-4 border-white shadow-[0_10px_0_rgba(15,23,42,0.16)] p-3.5 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full ${
                problem.category === 'proportions'
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              Tema: {problem.category === 'proportions' ? 'Proporciones' : 'Probabilidad'}
            </span>
            {problem.visualBadge && (
              <span className="text-xs font-black bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                {problem.visualBadge}
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug text-center">
            {problem.prompt}
          </p>

          <div className="text-center my-2">
            <span className="inline-block rounded-2xl bg-slate-900 text-white px-4 py-1 font-display text-base sm:text-lg font-bold tracking-wide">
              {problem.shortExpr}
            </span>
            {wrongChoices.length > 0 && (
              <p className="mt-1.5 text-xs font-extrabold text-amber-700 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{problem.hint}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {problem.options.map((opt, idx) => {
              const isWrong = wrongChoices.includes(opt);
              return (
                <button
                  key={`${problem.id}-${String(opt)}`}
                  type="button"
                  disabled={locked || isWrong}
                  onClick={() => onSelectAnswer(opt)}
                  className={`btn-toy relative rounded-2xl border-2 border-b-[5px] py-2.5 sm:py-3 px-3 font-display text-base sm:text-xl font-bold transition-all cursor-pointer ${
                    isWrong
                      ? 'bg-rose-100 border-rose-200 text-rose-300 line-through cursor-not-allowed'
                      : 'bg-sky-500 hover:bg-sky-400 border-sky-700 text-white shadow-md'
                  }`}
                >
                  <span className="absolute top-1 left-2 text-[10px] font-sans font-black opacity-75">
                    {idx + 1}
                  </span>
                  {String(opt)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
