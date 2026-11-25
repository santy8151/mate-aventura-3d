import { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { HUD } from './components/HUD';
import { Level1BattleUI } from './components/Level1BattleUI';
import { Level2RaceUI } from './components/Level2RaceUI';
import { Level3PlatformUI } from './components/Level3PlatformUI';
import { Level4OwlUI } from './components/Level4OwlUI';
import { GameOverModal, LevelCompleteModal } from './components/Modals';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { GameStage3D } from './three/GameStage3D';
import type {
  BattleVisualState,
  GameScreen,
  LaneIndex,
  LevelNumber,
  MathProblem,
  OwlVisualState,
  PlatformVisualState,
  PlayerStats,
  RaceVisualState,
} from './types/game';
import { generateMathProblem } from './utils/mathGenerator';

const MAX_LIVES = 3;
const TOTAL_PLATFORM_STAGES = 4;

export function App() {
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [level, setLevel] = useState<LevelNumber>(1);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [muted, setMuted] = useState<boolean>(false);

  const [stats, setStats] = useState<PlayerStats>({
    heroName: 'Súper Explorador',
    coins: 0,
    totalCorrect: 0,
    totalWrong: 0,
    streak: 0,
    bestStreak: 0,
    favoriteLevel: '',
    reflectionText: '',
  });

  // Estado Nivel 1: Batalla de Superhéroes
  const [battleProblem, setBattleProblem] = useState<MathProblem>(() => generateMathProblem(1, 0));
  const [battleWrongChoices, setBattleWrongChoices] = useState<number[]>([]);
  const [battleLocked, setBattleLocked] = useState(false);
  const [battleFeedback, setBattleFeedback] = useState<{ type: 'good' | 'bad'; text: string } | null>(null);
  const [battleVisual, setBattleVisual] = useState<BattleVisualState>({
    round: 0,
    villainHp: 3,
    maxVillainHp: 3,
    event: 'idle',
    eventTick: 0,
  });

  // Estado Nivel 2: Carrera Matemática
  const [raceProblem, setRaceProblem] = useState<MathProblem>(() => generateMathProblem(2, 0));
  const [raceFeedback, setRaceFeedback] = useState<{ type: 'good' | 'bad'; text: string } | null>(null);
  const [raceVisual, setRaceVisual] = useState<RaceVisualState>(() => {
    const p = generateMathProblem(2, 0);
    return {
      lane: 1,
      gateProgress: 0,
      totalGates: 3,
      portalDistance: 1,
      portalOptions: p.options as [number, number, number],
      correctLane: p.options.indexOf(p.answer) as LaneIndex,
      event: 'driving',
      eventTick: 0,
      turboActive: false,
    };
  });
  const racePausedRef = useRef(false);
  const raceBoostTimerRef = useRef(0);

  // Estado Nivel 3: Plataformas Mario Bros (4 problemas progresivos + evolución)
  const [platformProblem, setPlatformProblem] = useState<MathProblem>(() => generateMathProblem(3, 0));
  const [platformLocked, setPlatformLocked] = useState(false);
  const [platformFeedback, setPlatformFeedback] = useState<{ type: 'good' | 'bad'; text: string } | null>(null);
  const [platformVisual, setPlatformVisual] = useState<PlatformVisualState>({
    stageIndex: 0,
    totalStages: TOTAL_PLATFORM_STAGES,
    jumpCount: 0,
    targetAnswer: 4,
    evolutionTier: 0,
    evolved: false,
    event: 'idle',
    eventTick: 0,
  });
  const headAnchorRef = useRef<HTMLDivElement | null>(null);

  // Estado Nivel 4: Búho Mentor
  const [owlVisual, setOwlVisual] = useState<OwlVisualState>({
    step: 'summary',
    event: 'idle',
    eventTick: 0,
  });

  const timersRef = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const initLevel1 = useCallback(() => {
    clearTimers();
    const p = generateMathProblem(1, 0);
    setBattleProblem(p);
    setBattleWrongChoices([]);
    setBattleLocked(false);
    setBattleFeedback(null);
    setBattleVisual((prev) => ({
      round: 0,
      villainHp: 3,
      maxVillainHp: 3,
      event: 'idle',
      eventTick: prev.eventTick + 1,
    }));
  }, [clearTimers]);

  const initLevel2 = useCallback(() => {
    clearTimers();
    const p = generateMathProblem(2, 0);
    racePausedRef.current = false;
    raceBoostTimerRef.current = 0;
    setRaceProblem(p);
    setRaceFeedback(null);
    setRaceVisual((prev) => ({
      lane: 1,
      gateProgress: 0,
      totalGates: 3,
      portalDistance: 1,
      portalOptions: p.options as [number, number, number],
      correctLane: p.options.indexOf(p.answer) as LaneIndex,
      event: 'driving',
      eventTick: prev.eventTick + 1,
      turboActive: false,
    }));
  }, [clearTimers]);

  const initLevel3 = useCallback(() => {
    clearTimers();
    const p = generateMathProblem(3, 0);
    setPlatformProblem(p);
    setPlatformLocked(false);
    setPlatformFeedback(null);
    setPlatformVisual((prev) => ({
      stageIndex: 0,
      totalStages: TOTAL_PLATFORM_STAGES,
      jumpCount: 0,
      targetAnswer: p.answer,
      evolutionTier: 0,
      evolved: false,
      event: 'idle',
      eventTick: prev.eventTick + 1,
    }));
  }, [clearTimers]);

  const initLevel4 = useCallback(() => {
    clearTimers();
    setOwlVisual((prev) => ({
      step: 'summary',
      event: 'idle',
      eventTick: prev.eventTick + 1,
    }));
    soundEngine.playOwlHoot();
  }, [clearTimers]);

  const startLevel = useCallback(
    (targetLevel: LevelNumber) => {
      setLives(MAX_LIVES);
      setLevel(targetLevel);
      setScreen('playing');
      if (targetLevel === 1) initLevel1();
      if (targetLevel === 2) initLevel2();
      if (targetLevel === 3) initLevel3();
      if (targetLevel === 4) initLevel4();
    },
    [initLevel1, initLevel2, initLevel3, initLevel4]
  );

  const handleStartAdventure = () => {
    soundEngine.playSuccess();
    setStats((prev) => ({
      ...prev,
      heroName: prev.heroName.trim() || 'Súper Explorador',
      coins: 0,
      totalCorrect: 0,
      totalWrong: 0,
      streak: 0,
      bestStreak: 0,
      favoriteLevel: '',
      reflectionText: '',
    }));
    startLevel(1);
  };

  const handleRestartLevel = () => {
    soundEngine.playClick();
    startLevel(level);
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
    if (!next) soundEngine.playClick();
  };

  const recordCorrect = useCallback((coinReward: number) => {
    setStats((prev) => {
      const nextStreak = prev.streak + 1;
      return {
        ...prev,
        coins: prev.coins + coinReward + Math.min(15, prev.streak * 3),
        totalCorrect: prev.totalCorrect + 1,
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
    });
  }, []);

  const recordWrong = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      totalWrong: prev.totalWrong + 1,
      streak: 0,
    }));
  }, []);

  // ==========================================
  // LÓGICA NIVEL 1: BATALLA DE SUPERHÉROES
  // ==========================================
  const handleBattleAnswer = useCallback(
    (choice: number) => {
      if (battleLocked || screen !== 'playing' || level !== 1) return;

      if (choice === battleProblem.answer) {
        setBattleLocked(true);
        soundEngine.playPowerAttack();
        scheduleTimeout(() => soundEngine.playSuccess(), 180);

        recordCorrect(15);
        const nextRound = battleVisual.round + 1;
        const nextHp = Math.max(0, battleVisual.villainHp - 1);
        const isVictory = nextHp === 0;

        setBattleVisual((prev) => ({
          ...prev,
          villainHp: nextHp,
          event: isVictory ? 'villain-defeated' : 'hero-attack',
          eventTick: prev.eventTick + 1,
        }));

        setBattleFeedback({
          type: 'good',
          text: isVictory
            ? '¡Súper Rayo Final! ¡Derrotaste al Dr. Glitcheo!'
            : '¡Impacto directo! +15 monedas',
        });

        if (isVictory) {
          scheduleTimeout(() => {
            soundEngine.playLevelWin();
            setScreen('level-complete');
          }, 1250);
        } else {
          scheduleTimeout(() => {
            const nextProb = generateMathProblem(1, nextRound);
            setBattleProblem(nextProb);
            setBattleWrongChoices([]);
            setBattleFeedback(null);
            setBattleLocked(false);
            setBattleVisual((prev) => ({
              ...prev,
              round: nextRound,
              event: 'idle',
              eventTick: prev.eventTick + 1,
            }));
          }, 950);
        }
      } else {
        soundEngine.playError();
        recordWrong();
        setBattleWrongChoices((prev) => [...prev, choice]);
        setBattleVisual((prev) => ({
          ...prev,
          event: 'villain-attack',
          eventTick: prev.eventTick + 1,
        }));

        const nextLives = lives - 1;
        setLives(nextLives);
        setBattleFeedback({
          type: 'bad',
          text: `¡Casi! ${choice} no es correcto. ¡Perdiste 1 corazón!`,
        });

        if (nextLives <= 0) {
          setBattleLocked(true);
          scheduleTimeout(() => setScreen('game-over'), 700);
        }
      }
    },
    [battleLocked, screen, level, battleProblem, battleVisual, lives, recordCorrect, recordWrong, scheduleTimeout]
  );

  // ==========================================
  // LÓGICA NIVEL 2: CARRERA MATEMÁTICA
  // ==========================================
  const handleSelectRaceLane = useCallback(
    (lane: LaneIndex) => {
      if (screen !== 'playing' || level !== 2 || racePausedRef.current) return;
      soundEngine.playClick();
      setRaceVisual((prev) => ({ ...prev, lane }));
    },
    [screen, level]
  );

  const handleShiftRaceLane = useCallback(
    (delta: -1 | 1) => {
      if (screen !== 'playing' || level !== 2 || racePausedRef.current) return;
      soundEngine.playClick();
      setRaceVisual((prev) => {
        const nextLane = Math.max(0, Math.min(2, prev.lane + delta)) as LaneIndex;
        return nextLane === prev.lane ? prev : { ...prev, lane: nextLane };
      });
    },
    [screen, level]
  );

  const handleBoostApproach = useCallback(() => {
    if (screen !== 'playing' || level !== 2 || racePausedRef.current) return;
    soundEngine.playTurbo();
    raceBoostTimerRef.current = 1.4;
  }, [screen, level]);

  const raceLivesRef = useRef(lives);
  raceLivesRef.current = lives;

  useEffect(() => {
    if (screen !== 'playing' || level !== 2) return;

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      rafId = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (racePausedRef.current) return;

      if (raceBoostTimerRef.current > 0) {
        raceBoostTimerRef.current = Math.max(0, raceBoostTimerRef.current - dt);
      }

      const speed = raceBoostTimerRef.current > 0 ? 0.62 : 0.135;

      setRaceVisual((prev) => {
        if (racePausedRef.current) return prev;
        const nextDist = prev.portalDistance - dt * speed;
        if (nextDist > 0.03) {
          return { ...prev, portalDistance: nextDist };
        }

        raceBoostTimerRef.current = 0;
        const hitCorrect = prev.lane === prev.correctLane;

        if (hitCorrect) {
          soundEngine.playTurbo();
          scheduleTimeout(() => soundEngine.playSuccess(), 120);
          recordCorrect(20);

          const nextGate = prev.gateProgress + 1;
          if (nextGate >= prev.totalGates) {
            racePausedRef.current = true;
            setRaceFeedback({ type: 'good', text: '¡TURBO FINAL! ¡Meta alcanzada!' });
            scheduleTimeout(() => {
              soundEngine.playLevelWin();
              setScreen('level-complete');
            }, 1250);
            return {
              ...prev,
              gateProgress: nextGate,
              portalDistance: 0,
              event: 'finish',
              eventTick: prev.eventTick + 1,
              turboActive: true,
            };
          }

          const nextProb = generateMathProblem(2, nextGate);
          setRaceProblem(nextProb);
          setRaceFeedback({ type: 'good', text: '¡TURBO ACTIVADO! +20 monedas' });
          scheduleTimeout(() => setRaceFeedback(null), 1300);

          return {
            ...prev,
            gateProgress: nextGate,
            portalDistance: 1,
            portalOptions: nextProb.options as [number, number, number],
            correctLane: nextProb.options.indexOf(nextProb.answer) as LaneIndex,
            event: 'turbo',
            eventTick: prev.eventTick + 1,
            turboActive: true,
          };
        } else {
          soundEngine.playError();
          recordWrong();
          const remainingLives = raceLivesRef.current - 1;
          setLives(remainingLives);

          if (remainingLives <= 0) {
            racePausedRef.current = true;
            setRaceFeedback({ type: 'bad', text: '¡Oh no! Te quedaste sin corazones.' });
            scheduleTimeout(() => setScreen('game-over'), 650);
            return {
              ...prev,
              portalDistance: 0,
              event: 'crash',
              eventTick: prev.eventTick + 1,
              turboActive: false,
            };
          }

          const retryProb = generateMathProblem(2, prev.gateProgress);
          setRaceProblem(retryProb);
          setRaceFeedback({
            type: 'bad',
            text: '¡Choque! Ese carril no era el correcto. ¡Siguiente intento!',
          });
          scheduleTimeout(() => setRaceFeedback(null), 1500);

          return {
            ...prev,
            portalDistance: 1,
            portalOptions: retryProb.options as [number, number, number],
            correctLane: retryProb.options.indexOf(retryProb.answer) as LaneIndex,
            event: 'crash',
            eventTick: prev.eventTick + 1,
            turboActive: false,
          };
        }
      });
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [screen, level, recordCorrect, recordWrong, scheduleTimeout]);

  // ==========================================
  // LÓGICA NIVEL 3: MUNDO MARIO (4 PROBLEMAS)
  // ==========================================
  const handleHeroHeadScreenPos = useCallback((xPct: number, yPct: number) => {
    const el = headAnchorRef.current;
    if (!el) return;
    el.style.left = `${Math.max(12, Math.min(88, xPct))}%`;
    el.style.top = `${Math.max(28, Math.min(68, yPct))}%`;
  }, []);

  const handlePlatformJump = useCallback(() => {
    if (screen !== 'playing' || level !== 3 || platformVisual.evolved || platformLocked) return;
    setPlatformFeedback(null);
    setPlatformVisual((prev) => {
      const nextCount = Math.min(25, prev.jumpCount + 1);
      soundEngine.playJump(nextCount);
      return {
        ...prev,
        jumpCount: nextCount,
        event: 'jump',
        eventTick: prev.eventTick + 1,
      };
    });
  }, [screen, level, platformVisual.evolved, platformLocked]);

  const handlePlatformResetCount = useCallback(() => {
    if (screen !== 'playing' || level !== 3 || platformVisual.evolved || platformLocked) return;
    soundEngine.playClick();
    setPlatformFeedback(null);
    setPlatformVisual((prev) => ({
      ...prev,
      jumpCount: 0,
      event: 'idle',
      eventTick: prev.eventTick + 1,
    }));
  }, [screen, level, platformVisual.evolved, platformLocked]);

  const handlePlatformConfirm = useCallback(() => {
    if (
      screen !== 'playing' ||
      level !== 3 ||
      platformVisual.evolved ||
      platformLocked ||
      platformVisual.jumpCount === 0
    ) {
      return;
    }

    if (platformVisual.jumpCount === platformProblem.answer) {
      const nextStage = platformVisual.stageIndex + 1;
      const isFinalStage = nextStage >= TOTAL_PLATFORM_STAGES;

      if (isFinalStage) {
        soundEngine.playEvolution();
        recordCorrect(35);
        setPlatformFeedback({
          type: 'good',
          text: '¡EVOLUCIÓN SUPREMA! ¡Has ganado la Corona Real y la Bandera Meta! +35 monedas',
        });
        setPlatformVisual((prev) => ({
          ...prev,
          evolutionTier: 4,
          evolved: true,
          event: 'evolve',
          eventTick: prev.eventTick + 1,
        }));
      } else {
        soundEngine.playSuccess();
        scheduleTimeout(() => soundEngine.playEvolution(), 160);
        recordCorrect(20);
        setPlatformLocked(true);

        const nextProb = generateMathProblem(3, nextStage);
        const powerNames = ['', 'Poder Rojo', 'Capa Heroica', 'Aura Estelar'];
        setPlatformFeedback({
          type: 'good',
          text: `¡Exacto! Evolucionaste a ${powerNames[nextStage]} (+20 monedas). ¡Avanzando al bloque ${nextStage + 1}!`,
        });

        setPlatformVisual((prev) => ({
          ...prev,
          stageIndex: nextStage,
          jumpCount: 0,
          targetAnswer: nextProb.answer,
          evolutionTier: nextStage,
          event: 'advance',
          eventTick: prev.eventTick + 1,
        }));

        scheduleTimeout(() => {
          setPlatformProblem(nextProb);
          setPlatformLocked(false);
          setPlatformFeedback(null);
        }, 1650);
      }
    } else {
      soundEngine.playError();
      recordWrong();
      const nextLives = lives - 1;
      setLives(nextLives);
      const hintDir =
        platformVisual.jumpCount < platformProblem.answer
          ? `Contaste ${platformVisual.jumpCount}, pero faltaron saltos.`
          : `Contaste ${platformVisual.jumpCount} y te pasaste.`;

      setPlatformFeedback({
        type: 'bad',
        text: `¡Ups! ${hintDir} Intenta contar de nuevo (${platformProblem.hint})`,
      });
      setPlatformVisual((prev) => ({
        ...prev,
        jumpCount: 0,
        event: 'bump-fail',
        eventTick: prev.eventTick + 1,
      }));

      if (nextLives <= 0) {
        setPlatformLocked(true);
        scheduleTimeout(() => setScreen('game-over'), 650);
      }
    }
  }, [
    screen,
    level,
    platformVisual.evolved,
    platformVisual.jumpCount,
    platformVisual.stageIndex,
    platformLocked,
    platformProblem,
    lives,
    recordCorrect,
    recordWrong,
    scheduleTimeout,
  ]);

  const handleProceedToLevel4 = useCallback(() => {
    soundEngine.playLevelWin();
    startLevel(4);
  }, [startLevel]);

  // ==========================================
  // LÓGICA NIVEL 4: REFLEXIÓN CON EL BÚHO MENTOR
  // ==========================================
  const handleOwlAdvanceStep = useCallback(
    (nextStep: OwlVisualState['step'], event: OwlVisualState['event']) => {
      if (nextStep === 'certificate') {
        soundEngine.playGrandVictory();
        setStats((prev) => ({ ...prev, coins: prev.coins + 50 }));
      } else {
        soundEngine.playOwlHoot();
      }
      setOwlVisual((prev) => ({
        step: nextStep,
        event,
        eventTick: prev.eventTick + 1,
      }));
    },
    []
  );

  const handleSaveReflection = useCallback((favoriteLevel: string, reflectionText: string) => {
    setStats((prev) => ({ ...prev, favoriteLevel, reflectionText }));
  }, []);

  const getLevelProgress = (): number => {
    if (level === 1) return battleVisual.round / 3;
    if (level === 2) return raceVisual.gateProgress / raceVisual.totalGates;
    if (level === 3) return platformVisual.evolved ? 1 : platformVisual.stageIndex / TOTAL_PLATFORM_STAGES;
    if (owlVisual.step === 'summary') return 0.25;
    if (owlVisual.step === 'q1') return 0.5;
    if (owlVisual.step === 'q2') return 0.75;
    return 1;
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-sky-200 select-none">
      <GameStage3D
        screen={screen}
        level={level}
        battleState={battleVisual}
        raceState={raceVisual}
        platformState={platformVisual}
        owlState={owlVisual}
        onSelectRaceLane={handleSelectRaceLane}
        onHeroHeadScreenPos={handleHeroHeadScreenPos}
      />

      {screen !== 'welcome' && (
        <HUD
          level={level}
          levelProgress={getLevelProgress()}
          lives={lives}
          maxLives={MAX_LIVES}
          coins={stats.coins}
          streak={stats.streak}
          muted={muted}
          onRestartLevel={handleRestartLevel}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'welcome' && (
        <WelcomeOverlay
          heroName={stats.heroName}
          onChangeHeroName={(name) => setStats((prev) => ({ ...prev, heroName: name }))}
          onStart={handleStartAdventure}
        />
      )}

      {screen === 'playing' && level === 1 && (
        <Level1BattleUI
          problem={battleProblem}
          round={battleVisual.round}
          maxRounds={3}
          villainHp={battleVisual.villainHp}
          maxVillainHp={battleVisual.maxVillainHp}
          wrongChoices={battleWrongChoices}
          feedback={battleFeedback}
          locked={battleLocked}
          onSelectAnswer={handleBattleAnswer}
        />
      )}

      {screen === 'playing' && level === 2 && (
        <Level2RaceUI
          problem={raceProblem}
          lane={raceVisual.lane}
          gateProgress={raceVisual.gateProgress}
          totalGates={raceVisual.totalGates}
          portalDistance={raceVisual.portalDistance}
          feedback={raceFeedback}
          onChangeLane={handleSelectRaceLane}
          onShiftLane={handleShiftRaceLane}
          onBoostApproach={handleBoostApproach}
        />
      )}

      {screen === 'playing' && level === 3 && (
        <Level3PlatformUI
          problem={platformProblem}
          stageIndex={platformVisual.stageIndex}
          totalStages={platformVisual.totalStages}
          evolutionTier={platformVisual.evolutionTier}
          jumpCount={platformVisual.jumpCount}
          evolved={platformVisual.evolved}
          locked={platformLocked}
          headAnchorRef={headAnchorRef}
          feedback={platformFeedback}
          onJump={handlePlatformJump}
          onResetCount={handlePlatformResetCount}
          onConfirmCount={handlePlatformConfirm}
          onProceedToLevel4={handleProceedToLevel4}
        />
      )}

      {screen === 'playing' && level === 4 && (
        <Level4OwlUI
          stats={stats}
          step={owlVisual.step}
          onAdvanceStep={handleOwlAdvanceStep}
          onSaveReflection={handleSaveReflection}
          onPlayAgain={() => {
            soundEngine.playClick();
            setScreen('welcome');
          }}
        />
      )}

      {screen === 'level-complete' && (
        <LevelCompleteModal
          completedLevel={level}
          coins={stats.coins}
          onNextLevel={() => {
            soundEngine.playClick();
            const next = Math.min(4, level + 1) as LevelNumber;
            startLevel(next);
          }}
        />
      )}

      {screen === 'game-over' && (
        <GameOverModal level={level} onRetryLevel={handleRestartLevel} />
      )}
    </main>
  );
}

export default App;
