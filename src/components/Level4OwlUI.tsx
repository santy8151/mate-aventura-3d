import React, { useState } from 'react';
import { Award, CheckCircle2, Coins, Crown, GraduationCap, Printer, RotateCcw, Send, Sparkles, Trophy } from 'lucide-react';
import type { OwlVisualState, PlayerStats } from '../types/game';
import { buildOwlReflectionReply } from '../utils/mathGenerator';

interface Level4OwlUIProps {
  stats: PlayerStats;
  step: OwlVisualState['step'];
  onAdvanceStep: (nextStep: OwlVisualState['step'], event: OwlVisualState['event']) => void;
  onSaveReflection: (favoriteLevel: string, reflectionText: string) => void;
  onPlayAgain: () => void;
}

const LEVEL_CHOICES = [
  'Nivel 1: Batalla de Superhéroes',
  'Nivel 2: Carrera Matemática',
  'Nivel 3: Saltos y Evolución',
  '¡Todos me encantaron por igual!',
];

const STARTER_CHIPS = [
  'Conté con mis dedos paso a paso',
  'Lo calculé rápido en mi cabeza',
  'Empecé desde el número más grande y sumé',
  'Me imaginé saltando como en el nivel 3',
];

export const Level4OwlUI: React.FC<Level4OwlUIProps> = ({
  stats,
  step,
  onAdvanceStep,
  onSaveReflection,
  onPlayAgain,
}) => {
  const [selectedLevel, setSelectedLevel] = useState(stats.favoriteLevel || '');
  const [reflectionText, setReflectionText] = useState(stats.reflectionText || '');
  const [mentorReply, setMentorReply] = useState('');

  const accuracy =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)
      : 100;

  const handleChooseQ1 = (choice: string) => {
    setSelectedLevel(choice);
    onAdvanceStep('q2', 'happy');
  };

  const handleSubmitQ2 = (e: React.FormEvent) => {
    e.preventDefault();
    const finalText = reflectionText.trim() || 'Sumé y resté contando con mucha atención.';
    setReflectionText(finalText);
    onSaveReflection(selectedLevel, finalText);
    const reply = buildOwlReflectionReply(selectedLevel, finalText, {
      ...stats,
      coins: stats.coins + 50,
    });
    setMentorReply(reply);
    onAdvanceStep('certificate', 'trophy');
  };

  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (step === 'certificate') {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="pointer-events-auto w-full max-w-2xl rounded-[2rem] bg-gradient-to-b from-amber-50 via-white to-amber-50 border-[6px] border-amber-400 shadow-[0_14px_0_rgba(120,53,15,0.28)] p-5 sm:p-7 animate-pop-in text-center">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-4 border-white shadow-lg flex items-center justify-center">
              <Trophy className="w-9 h-9 text-amber-950" />
            </div>
          </div>

          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
            Certificado Oficial de MateAventura 3D
          </p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
            ¡Felicidades, {stats.heroName || 'Súper Explorador'}!
          </h2>

          {/* Mensaje personalizado del Búho Mentor */}
          <div className="mt-3 rounded-2xl bg-violet-50 border-2 border-violet-200 p-3.5 text-left flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-violet-700 uppercase">
                Mensaje del Profesor Búho Sabio:
              </p>
              <p className="text-sm font-bold text-slate-700 leading-snug mt-0.5">{mentorReply}</p>
            </div>
          </div>

          {/* Medallero de logros */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-amber-100/80 border-2 border-amber-300 p-2.5">
              <div className="flex items-center justify-center gap-1 text-amber-700 font-black text-xs">
                <Coins className="w-4 h-4" />
                <span>Monedas</span>
              </div>
              <p className="font-display text-2xl font-bold text-amber-950">{stats.coins}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100/80 border-2 border-emerald-300 p-2.5">
              <div className="flex items-center justify-center gap-1 text-emerald-700 font-black text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Precisión</span>
              </div>
              <p className="font-display text-2xl font-bold text-emerald-950">{accuracy}%</p>
            </div>
            <div className="rounded-2xl bg-purple-100/80 border-2 border-purple-300 p-2.5">
              <div className="flex items-center justify-center gap-1 text-purple-700 font-black text-xs">
                <Crown className="w-4 h-4" />
                <span>Rango</span>
              </div>
              <p className="font-display text-lg sm:text-xl font-bold text-purple-950">Coronado</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
            Mi estrategia matemática: <span className="italic text-slate-800">“{reflectionText}”</span> • {today}
          </div>

          <div className="no-print mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-toy w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white border-2 border-sky-700 border-b-[5px] px-5 py-3 font-extrabold text-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Certificado</span>
            </button>

            <button
              type="button"
              onClick={onPlayAgain}
              className="btn-toy w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-emerald-700 border-b-[5px] px-6 py-3 font-display text-lg font-bold cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Jugar Otra Partida</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-20 pb-4 px-3 sm:px-6">
      {/* Encabezado Nivel 4 */}
      <div className="mx-auto">
        <div className="pointer-events-auto rounded-2xl bg-violet-600/90 backdrop-blur text-white border-2 border-violet-300 px-4 py-1.5 text-xs sm:text-sm font-black shadow-md flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-300" />
          <span>Nivel 4: Reflexión con el Búho Mentor</span>
        </div>
      </div>

      {/* Cuadro de diálogo novela visual Nintendo */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="pointer-events-auto rounded-[1.85rem] bg-amber-50/96 backdrop-blur-md border-4 border-amber-300 shadow-[0_10px_0_rgba(15,23,42,0.22)] p-4 sm:p-6 animate-pop-in">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-white px-3.5 py-1 text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Profesor Búho Sabio</span>
            </span>
            <span className="text-xs font-extrabold text-amber-800">
              {step === 'summary' ? 'Resumen' : step === 'q1' ? 'Pregunta 1 de 2' : 'Pregunta 2 de 2'}
            </span>
          </div>

          {step === 'summary' && (
            <div>
              <p className="text-base sm:text-lg font-extrabold text-slate-800 leading-snug">
                ¡Uh-uhú, bravo {stats.heroName || 'Súper Explorador'}! Has derrotado al Dr. Glitcheo,
                conquistado la autopista y evolucionado con la Corona Real. ¡Mira todo lo que lograste!
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-2xl bg-white border-2 border-amber-200 p-2.5">
                  <div className="text-xs font-black text-amber-700">Monedas</div>
                  <div className="font-display text-2xl font-bold text-slate-900">{stats.coins}</div>
                </div>
                <div className="rounded-2xl bg-white border-2 border-emerald-200 p-2.5">
                  <div className="text-xs font-black text-emerald-700">Aciertos</div>
                  <div className="font-display text-2xl font-bold text-slate-900">
                    {stats.totalCorrect}
                  </div>
                </div>
                <div className="rounded-2xl bg-white border-2 border-purple-200 p-2.5">
                  <div className="text-xs font-black text-purple-700">Precisión</div>
                  <div className="font-display text-2xl font-bold text-slate-900">{accuracy}%</div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => onAdvanceStep('q1', 'talk')}
                  className="btn-toy flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-emerald-700 border-b-[5px] px-6 py-3 font-display text-lg font-bold cursor-pointer"
                >
                  <span>¡Listo para reflexionar!</span>
                  <Award className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 'q1' && (
            <div>
              <p className="text-base sm:text-lg font-extrabold text-slate-800">
                Pregunta 1: Pensando en tu aventura de hoy, ¿qué nivel te pareció más fácil o divertido?
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LEVEL_CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => handleChooseQ1(choice)}
                    className="btn-toy text-left rounded-2xl bg-white hover:bg-sky-50 border-2 border-amber-300 hover:border-sky-400 border-b-4 px-4 py-3 text-sm font-extrabold text-slate-800 cursor-pointer"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'q2' && (
            <form onSubmit={handleSubmitQ2}>
              <p className="text-base sm:text-lg font-extrabold text-slate-800">
                ¡Genial! Pregunta 2: Explica con tus palabras cómo resolviste las sumas y restas.
              </p>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                Puedes elegir una idea rápida o escribir la tuya abajo:
              </p>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {STARTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setReflectionText(chip)}
                    className={`rounded-full px-3 py-1 text-xs font-extrabold border-2 transition-all cursor-pointer ${
                      reflectionText === chip
                        ? 'bg-violet-600 border-violet-700 text-white'
                        : 'bg-white hover:bg-violet-50 border-violet-200 text-violet-800'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Ej. Conté hacia adelante desde el primer número o usé mis dedos..."
                className="mt-2.5 w-full rounded-2xl border-2 border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-violet-500 focus:outline-none"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="btn-toy flex items-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white border-2 border-violet-800 border-b-[5px] px-6 py-3 font-display text-lg font-bold cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Reflexión y Ver Medalla</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
