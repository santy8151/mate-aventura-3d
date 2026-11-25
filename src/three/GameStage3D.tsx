import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type {
  BattleVisualState,
  GameScreen,
  LaneIndex,
  LevelNumber,
  OwlVisualState,
  PlatformVisualState,
  RaceVisualState,
} from '../types/game';
import { BattleStage } from './stages/BattleStage';
import { OwlStage } from './stages/OwlStage';
import { PlatformStage } from './stages/PlatformStage';
import { RaceStage } from './stages/RaceStage';
import { WelcomeStage, type StageController } from './stages/WelcomeStage';

interface GameStage3DProps {
  screen: GameScreen;
  level: LevelNumber;
  battleState: BattleVisualState;
  raceState: RaceVisualState;
  platformState: PlatformVisualState;
  owlState: OwlVisualState;
  onSelectRaceLane: (lane: LaneIndex) => void;
  onHeroHeadScreenPos: (xPct: number, yPct: number) => void;
}

export const GameStage3D: React.FC<GameStage3DProps> = ({
  screen,
  level,
  battleState,
  raceState,
  platformState,
  owlState,
  onSelectRaceLane,
  onHeroHeadScreenPos,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<StageController | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Refs para callbacks recientes sin reconstruir la escena
  const onSelectRaceLaneRef = useRef(onSelectRaceLane);
  onSelectRaceLaneRef.current = onSelectRaceLane;
  const onHeroHeadScreenPosRef = useRef(onHeroHeadScreenPos);
  onHeroHeadScreenPosRef.current = onHeroHeadScreenPos;

  // Inicializar WebGLRenderer una sola vez
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.Fog(0xbae6fd, 24, 72);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      140
    );
    camera.position.set(0, 3.8, 9.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // Iluminación cálida estilo juguete Nintendo
    const hemi = new THREE.HemisphereLight(0xffffff, 0x86efac, 1.05);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfffbeb, 1.55);
    sun.position.set(8, 14, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 42;
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    sun.shadow.bias = -0.001;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fill.position.set(-8, 5, -6);
    scene.add(fill);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = Math.max(1, containerRef.current.clientHeight);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const elapsed = clock.elapsedTime;
      if (stageRef.current) {
        stageRef.current.update(dt, elapsed, camera);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      if (stageRef.current) {
        scene.remove(stageRef.current.root);
        stageRef.current.dispose();
        stageRef.current = null;
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Cambiar escenario 3D según pantalla / nivel activo
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    if (stageRef.current) {
      scene.remove(stageRef.current.root);
      stageRef.current.dispose();
      stageRef.current = null;
    }

    let nextStage: StageController;
    if (screen === 'welcome') {
      nextStage = new WelcomeStage();
    } else if (level === 1) {
      nextStage = new BattleStage();
    } else if (level === 2) {
      nextStage = new RaceStage((lane) => onSelectRaceLaneRef.current(lane));
    } else if (level === 3) {
      nextStage = new PlatformStage((x, y) => onHeroHeadScreenPosRef.current(x, y));
    } else {
      nextStage = new OwlStage();
    }

    stageRef.current = nextStage;
    scene.add(nextStage.root);
    scene.background = new THREE.Color(nextStage.skyColor);
    scene.fog = new THREE.Fog(nextStage.fogColor, 24, 72);

    camera.fov = 50;
    camera.position.copy(nextStage.cameraPos);
    camera.lookAt(nextStage.cameraTarget);
    camera.updateProjectionMatrix();
  }, [screen, level]);

  // Sincronizar estado reactivo hacia el escenario 3D activo
  useEffect(() => {
    const st = stageRef.current;
    if (!st) return;
    if (st instanceof BattleStage) st.syncState(battleState);
    if (st instanceof RaceStage) st.syncState(raceState);
    if (st instanceof PlatformStage) st.syncState(platformState);
    if (st instanceof OwlStage) st.syncState(owlState);
  }, [screen, level, battleState, raceState, platformState, owlState]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = stageRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!st || !camera || !renderer || !st.handlePointerClick) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    st.handlePointerClick(raycaster);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 w-full h-full cursor-pointer"
      aria-label="Escenario 3D interactivo del juego"
    />
  );
};
