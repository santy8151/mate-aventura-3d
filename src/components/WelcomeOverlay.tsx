import React from 'react';
import { Car, Compass, GraduationCap, Play, Sparkles, Swords } from 'lucide-react';

interface WelcomeOverlayProps {
  heroName: string;
  onChangeHeroName: (name: string) => void;
  onStart: () => void;
}

const ROADMAP = [
  {
    num: 1,
    title: 'Batalla con Aliados',
    desc: 'Proporciones, probabilidad y escudos',
    color: 'bg-sky-50 border-sky-200 text-sky-800',
    badge: 'bg-sky-500',
    Icon: Swords,
  },
  {
    num: 2,
    title: 'Carrera Matemática',
    desc: 'Cálculo rápido en autopista 3D',
    color: 'bg-rose-50 border-rose-200 text-rose-800',
    badge: 'bg-rose-500',
    Icon: Car,
  },
  {
    num: 3,
    title: 'Plano Cartesiano',
    desc: 'Coordenadas (X, Y) en Mundo Mario',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    badge: 'bg-amber-500',
    Icon: Compass,
  },
  {
    num: 4,
    title: 'Búho Mentor',
    desc: 'Casos de probabilidad y medalla',
    color: 'bg-violet-50 border-violet-200 text-violet-800',
    badge: 'bg-violet-500',
    Icon: GraduationCap,
  },
];

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({
  heroName,
  onChangeHeroName,
  onStart,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center p-3 sm:p-5">
      <div className="pointer-events-auto w-full max-w-3xl rounded-[2rem] bg-white/92 backdrop-blur-md border-4 border-white shadow-[0_12px_0_rgba(15,23,42,0.16)] p-4 sm:p-5 animate-pop-in">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border-2 border-amber-300 px-3 py-0.5 text-[11px] font-black text-amber-800 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Aventura 3D Estilo Nintendo</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Mate<span className="text-emerald-500">Aventura</span>{' '}
            <span className="text-amber-500">3D</span>
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm font-bold text-slate-600">
            ¡Domina proporciones, probabilidad y plano cartesiano en 4 mundos mágicos!
          </p>
        </div>

        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ROADMAP.map(({ num, title, desc, color, badge, Icon }) => (
            <div
              key={num}
              className={`rounded-2xl border-2 p-2.5 flex flex-col items-start gap-1 ${color}`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-xl ${badge} text-white flex items-center justify-center text-xs font-black`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-black uppercase opacity-75">Nivel {num}</span>
              </div>
              <p className="text-xs font-black leading-tight">{title}</p>
              <p className="text-[11px] font-semibold opacity-80 leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <label className="flex-1 block">
            <span className="block text-xs font-black text-slate-600 mb-1 ml-1">
              Nombre de tu Superhéroe (para tu certificado):
            </span>
            <input
              type="text"
              maxLength={24}
              value={heroName}
              onChange={(e) => onChangeHeroName(e.target.value)}
              placeholder="Súper Explorador"
              className="w-full rounded-2xl border-2 border-slate-300 bg-slate-50 px-4 py-2 text-base font-extrabold text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onStart}
            className="btn-toy flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-emerald-600 border-b-[6px] px-7 py-2.5 text-lg font-display font-bold shadow-lg cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>¡Jugar Ahora!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
