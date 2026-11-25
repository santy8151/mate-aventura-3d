import * as THREE from 'three';
import type { PlatformVisualState } from '../../types/game';
import {
  createCloudModel,
  createCoinMesh,
  createHeroModel,
  createMarioCastle,
  createMarioHill,
  createRainbowArch,
  createSkyAirship,
  createWarpPipe,
  createWingedBuddy,
  createWonderFlower,
  createWonderTree,
} from '../models';
import type { HeroRig } from '../models';
import { ParticleBurstSystem } from '../particles';
import {
  createAxisTileTexture,
  createMarioBrickTexture,
  createMarioSoilTexture,
  createMysteryBlockTexture,
  createSkyDome,
  createWonderTileTexture,
} from '../textures';
import type { StageController } from './WelcomeStage';

const GRID_STEP = 1.85;
const GRID_SIZE = 6; // Coordenadas 0..5 en X e Y

export class PlatformStage implements StageController {
  public readonly root = new THREE.Group();
  public readonly skyColor = 0x0284c7;
  public readonly fogColor = 0xbae6fd;
  // Cámara panorámica MÁS ALEJADA para ver todo el Plano Cartesiano 3D y el mundo Mario Wonder
  public readonly cameraPos = new THREE.Vector3(6.8, 10.6, 17.6);
  public readonly cameraTarget = new THREE.Vector3(4.6, 0.8, -4.4);

  private hero: HeroRig;
  private tileMeshes: THREE.Mesh[][] = [];
  private clickableTiles: THREE.Mesh[] = [];
  private colGuide: THREE.Mesh;
  private rowGuide: THREE.Mesh;

  private discoveredGroup = new THREE.Group();
  private renderedFoundCount = 0;

  private airship: THREE.Group;
  private wingedBuddies: THREE.Group[] = [];
  private wonderDecor: THREE.Group[] = [];
  private particles = new ParticleBurstSystem();

  private currentWorldPos = new THREE.Vector3(0, 0.2, 0);
  private targetWorldPos = new THREE.Vector3(0, 0.2, 0);
  private hopStartPos = new THREE.Vector3(0, 0.2, 0);
  private hopProgress = 1;
  private isHopping = false;

  private heroScale = 1;
  private targetHeroScale = 1;
  private evolutionTier = 0;
  private isEvolved = false;
  private lastEventTick = -1;
  private failShakeTimer = 0;

  private onSelectTile?: (x: number, y: number) => void;
  private onHeadScreenPos?: (x: number, y: number) => void;
  private projVec = new THREE.Vector3();

  constructor(
    onSelectTile?: (x: number, y: number) => void,
    onHeadScreenPos?: (xPct: number, yPct: number) => void
  ) {
    this.onSelectTile = onSelectTile;
    this.onHeadScreenPos = onHeadScreenPos;
    this.root.add(createSkyDome(0x0284c7, 0xbae6fd));
    this.root.add(this.particles.group);
    this.root.add(this.discoveredGroup);

    const soilTex = createMarioSoilTexture();
    soilTex.repeat.set(8, 3);
    const brickTex = createMarioBrickTexture();
    const mysteryTex = createMysteryBlockTexture();

    // Terraza amplia estilo Super Mario Bros. Wonder que sostiene el Plano Cartesiano
    const centerXZ = ((GRID_SIZE - 1) * GRID_STEP) / 2;
    const baseEarth = new THREE.Mesh(
      new THREE.BoxGeometry(17.5, 3.2, 16.5),
      new THREE.MeshStandardMaterial({ map: soilTex, roughness: 0.85 })
    );
    baseEarth.position.set(centerXZ, -1.8, -centerXZ);
    baseEarth.receiveShadow = true;
    this.root.add(baseEarth);

    const baseGrass = new THREE.Mesh(
      new THREE.BoxGeometry(18.0, 0.55, 17.0),
      new THREE.MeshPhysicalMaterial({ color: 0x22c55e, roughness: 0.5, clearcoat: 0.2 })
    );
    baseGrass.position.set(centerXZ, -0.25, -centerXZ);
    baseGrass.receiveShadow = true;
    this.root.add(baseGrass);

    // Tablero del Plano Cartesiano 3D (6x6 casillas clicables)
    const lightTex = createWonderTileTexture('light');
    const mintTex = createWonderTileTexture('mint');

    for (let x = 0; x < GRID_SIZE; x++) {
      this.tileMeshes[x] = [];
      for (let y = 0; y < GRID_SIZE; y++) {
        const isLight = (x + y) % 2 === 0;
        const tileMat = new THREE.MeshPhysicalMaterial({
          map: isLight ? lightTex : mintTex,
          roughness: 0.3,
          clearcoat: 0.55,
        });
        const tile = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.28, 1.66), tileMat);
        tile.position.set(x * GRID_STEP, 0.06, -y * GRID_STEP);
        tile.receiveShadow = true;
        tile.userData.coord = { x, y };
        this.root.add(tile);
        this.tileMeshes[x][y] = tile;
        this.clickableTiles.push(tile);
      }
    }

    // Guías luminosas de columna X y fila Y sobre el tablero
    this.colGuide = new THREE.Mesh(
      new THREE.PlaneGeometry(1.75, GRID_SIZE * GRID_STEP + 0.3),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.22 })
    );
    this.colGuide.rotation.x = -Math.PI / 2;
    this.colGuide.position.set(0, 0.21, -centerXZ);
    this.root.add(this.colGuide);

    this.rowGuide = new THREE.Mesh(
      new THREE.PlaneGeometry(GRID_SIZE * GRID_STEP + 0.3, 1.75),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.22 })
    );
    this.rowGuide.rotation.x = -Math.PI / 2;
    this.rowGuide.position.set(centerXZ, 0.21, 0);
    this.root.add(this.rowGuide);

    // Eje X (Rojo horizontal →) y Eje Y (Azul profundidad ↑) con fichas numéricas 0..5
    const xBeamMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.3,
      clearcoat: 0.6,
    });
    const xBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 11.4, 12), xBeamMat);
    xBeam.rotation.z = Math.PI / 2;
    xBeam.position.set(centerXZ + 0.4, 0.25, 1.25);
    const xArrow = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.65, 12), xBeamMat);
    xArrow.rotation.z = -Math.PI / 2;
    xArrow.position.set(10.8, 0.25, 1.25);
    this.root.add(xBeam, xArrow);

    const yBeamMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
      clearcoat: 0.6,
    });
    const yBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 11.4, 12), yBeamMat);
    yBeam.rotation.x = Math.PI / 2;
    yBeam.position.set(-1.35, 0.25, -centerXZ - 0.4);
    const yArrow = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.65, 12), yBeamMat);
    yArrow.rotation.x = -Math.PI / 2;
    yArrow.position.set(-1.35, 0.25, -10.8);
    this.root.add(yBeam, yArrow);

    for (let i = 0; i < GRID_SIZE; i++) {
      const xTile = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.22, 0.92),
        new THREE.MeshPhysicalMaterial({
          map: createAxisTileTexture(String(i), '#ef4444'),
          roughness: 0.25,
          clearcoat: 0.6,
        })
      );
      xTile.position.set(i * GRID_STEP, 0.22, 1.95);
      this.root.add(xTile);

      const yTile = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.22, 0.92),
        new THREE.MeshPhysicalMaterial({
          map: createAxisTileTexture(String(i), '#0284c7'),
          roughness: 0.25,
          clearcoat: 0.6,
        })
      );
      yTile.position.set(-2.05, 0.22, -i * GRID_STEP);
      this.root.add(yTile);
    }

    // Escenografía Super Mario Bros. Wonder alrededor de la cuadrícula
    const pipeL = createWarpPipe(2.1, true);
    pipeL.position.set(-3.6, 0, -9.8);
    const pipeR = createWarpPipe(2.4, false);
    pipeR.position.set(11.6, 0, -2.5);
    const wonderTree = createWonderTree(1.2);
    wonderTree.position.set(11.8, 0, -9.8);
    const brickMat = new THREE.MeshPhysicalMaterial({ map: brickTex, roughness: 0.55 });
    const mysteryMat = new THREE.MeshPhysicalMaterial({ map: mysteryTex, roughness: 0.25, clearcoat: 0.5 });

    const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), brickMat);
    b1.position.set(-3.8, 3.6, -4.5);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), mysteryMat);
    b2.position.set(-3.8, 3.6, -5.65);
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), brickMat);
    b3.position.set(-3.8, 3.6, -6.8);
    this.root.add(pipeL, pipeR, wonderTree, b1, b2, b3);

    // Arcoíris, castillo pastel, colinas, nubes, barco volador y compañeros alados
    const rainbow = createRainbowArch(18);
    rainbow.position.set(centerXZ, -1.5, -24);
    const castle = createMarioCastle(1.1);
    castle.position.set(centerXZ + 5.5, 0, -20);
    const hill1 = createMarioHill(0x22c55e, 4.2, 7.2);
    hill1.position.set(-7.5, -1, -18);
    const hill2 = createMarioHill(0xfacc15, 3.8, 6.2);
    hill2.position.set(16.5, -1, -19);
    const c1 = createCloudModel(1.7);
    c1.position.set(-4, 8.2, -16);
    const c2 = createCloudModel(1.5);
    c2.position.set(14, 9.0, -18);
    this.root.add(rainbow, castle, hill1, hill2, c1, c2);

    this.airship = createSkyAirship(0.9);
    this.airship.position.set(2, 9.5, -20);
    this.root.add(this.airship);

    [
      [-4.2, 4.8, -1.8, 0x16a34a],
      [12.2, 5.2, -6.4, 0xef4444],
    ].forEach(([bx, by, bz, col], idx) => {
      const buddy = createWingedBuddy(col);
      buddy.position.set(bx, by, bz);
      buddy.userData.baseY = by;
      buddy.userData.phase = idx * 1.9;
      this.root.add(buddy);
      this.wingedBuddies.push(buddy);
    });

    const wf1 = createWonderFlower(0.85);
    wf1.position.set(11.6, 3.4, -2.5);
    const coin1 = createCoinMesh();
    coin1.position.set(-3.8, 4.9, -5.65);
    this.root.add(wf1, coin1);
    this.wonderDecor.push(wf1, coin1);

    // Personaje jugador
    this.hero = createHeroModel(false);
    this.hero.root.position.copy(this.currentWorldPos);
    this.hero.root.rotation.y = 0.45;
    this.root.add(this.hero.root);
  }

  public syncState(state: PlatformVisualState): void {
    const destX = state.heroX * GRID_STEP;
    const destZ = -state.heroY * GRID_STEP;

    if (
      Math.abs(destX - this.targetWorldPos.x) > 0.05 ||
      Math.abs(destZ - this.targetWorldPos.z) > 0.05
    ) {
      this.hopStartPos.copy(this.currentWorldPos);
      this.targetWorldPos.set(destX, 0.2, destZ);
      this.hopProgress = 0;
      this.isHopping = true;

      const angle = Math.atan2(destX - this.hopStartPos.x, destZ - this.hopStartPos.z);
      this.hero.root.rotation.y = angle;
    }

    this.colGuide.position.x = destX;
    this.rowGuide.position.z = destZ;

    // Evolución progresiva
    if (state.evolutionTier !== this.evolutionTier || state.evolved !== this.isEvolved) {
      this.evolutionTier = state.evolutionTier;
      this.isEvolved = state.evolved;
      this.hero.setEvolutionTier(state.evolved ? 4 : state.evolutionTier);
      const scaleTable = [1.0, 1.08, 1.16, 1.24, 1.34];
      this.targetHeroScale = scaleTable[Math.min(4, state.evolved ? 4 : state.evolutionTier)];
    }

    // Mostrar flores maravilla / estrellas descubiertas en las coordenadas ya resueltas
    if (state.foundCoords.length < this.renderedFoundCount) {
      while (this.discoveredGroup.children.length > 0) {
        this.discoveredGroup.remove(this.discoveredGroup.children[0]);
      }
      this.renderedFoundCount = 0;
    }
    while (this.renderedFoundCount < state.foundCoords.length) {
      const c = state.foundCoords[this.renderedFoundCount];
      const flower = createWonderFlower(0.75);
      flower.position.set(c.x * GRID_STEP, 0.72, -c.y * GRID_STEP);
      this.discoveredGroup.add(flower);
      this.renderedFoundCount++;
    }

    if (state.eventTick === this.lastEventTick) return;
    this.lastEventTick = state.eventTick;

    if (state.event === 'idle') {
      this.currentWorldPos.set(destX, 0.2, destZ);
      this.targetWorldPos.copy(this.currentWorldPos);
      this.hero.root.position.copy(this.currentWorldPos);
      this.isHopping = false;
      this.hopProgress = 1;
    } else if (state.event === 'bump-fail') {
      this.failShakeTimer = 0.45;
      this.particles.burst(
        new THREE.Vector3(destX, 1.2, destZ),
        [0xef4444, 0xf97316],
        16,
        4.6
      );
    } else if (state.event === 'discover') {
      this.particles.burst(
        new THREE.Vector3(destX, 1.2, destZ),
        [0x38bdf8, 0xfacc15, 0x4ade80, 0xffffff],
        28,
        6.4
      );
    } else if (state.event === 'evolve') {
      this.particles.burst(
        new THREE.Vector3(destX, 1.5, destZ),
        [0xfacc15, 0xa855f7, 0x38bdf8, 0xf43f5e],
        42,
        7.6
      );
    }
  }

  public handlePointerClick(raycaster: THREE.Raycaster): void {
    if (!this.onSelectTile) return;
    const hits = raycaster.intersectObjects(this.clickableTiles, false);
    if (hits.length > 0) {
      const coord = hits[0].object.userData.coord as { x: number; y: number } | undefined;
      if (coord) {
        this.onSelectTile(coord.x, coord.y);
      }
    }
  }

  public update(dt: number, elapsed: number, camera: THREE.PerspectiveCamera): void {
    this.particles.update(dt);

    let yOffset = 0;
    if (this.isHopping) {
      this.hopProgress += dt * 4.2;
      if (this.hopProgress >= 1) {
        this.hopProgress = 1;
        this.isHopping = false;
        this.currentWorldPos.copy(this.targetWorldPos);
      } else {
        this.currentWorldPos.lerpVectors(this.hopStartPos, this.targetWorldPos, this.hopProgress);
        yOffset = Math.sin(this.hopProgress * Math.PI) * 1.15;
      }
    }

    this.hero.root.position.set(this.currentWorldPos.x, 0.2 + yOffset, this.currentWorldPos.z);

    if (this.failShakeTimer > 0) {
      this.failShakeTimer = Math.max(0, this.failShakeTimer - dt);
      this.hero.root.position.x += Math.sin(this.failShakeTimer * 36) * 0.22;
    }

    this.heroScale += (this.targetHeroScale - this.heroScale) * Math.min(1, dt * 6);
    this.hero.root.scale.setScalar(this.heroScale);

    if (this.isHopping) {
      this.hero.leftArm.rotation.z = 1.9;
      this.hero.rightArm.rotation.z = -1.9;
    } else if (this.isEvolved) {
      this.hero.leftArm.rotation.z = 0.6 + Math.sin(elapsed * 5) * 0.25;
      this.hero.rightArm.rotation.z = -0.6 - Math.sin(elapsed * 5) * 0.25;
      this.hero.auraRing.rotation.z = elapsed * 2.8;
    } else {
      this.hero.leftArm.rotation.z = 0.35;
      this.hero.rightArm.rotation.z = -0.35;
    }

    // Flores descubiertas girando alegres
    this.discoveredGroup.children.forEach((f, idx) => {
      f.rotation.y = elapsed * 1.8 + idx;
      f.position.y = 0.72 + Math.sin(elapsed * 2.5 + idx) * 0.12;
    });

    this.airship.position.x = 2 + Math.sin(elapsed * 0.25) * 4.5;
    this.airship.position.y = 9.5 + Math.sin(elapsed * 1.3) * 0.25;

    this.wingedBuddies.forEach((b) => {
      const ph = b.userData.phase as number;
      b.position.y = (b.userData.baseY as number) + Math.sin(elapsed * 2.5 + ph) * 0.45;
    });

    this.wonderDecor.forEach((d, idx) => {
      d.rotation.y = elapsed * 2.2 + idx;
    });

    // Proyectar etiqueta de coordenada actual sobre la cabeza del héroe
    if (this.onHeadScreenPos) {
      this.projVec.set(
        this.hero.root.position.x,
        this.hero.root.position.y + 2.6 * this.heroScale,
        this.hero.root.position.z
      );
      this.projVec.project(camera);
      const xPct = (this.projVec.x * 0.5 + 0.5) * 100;
      const yPct = (-this.projVec.y * 0.5 + 0.5) * 100;
      this.onHeadScreenPos(xPct, yPct);
    }
  }

  public dispose(): void {
    this.particles.dispose();
    this.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if ('map' in m && m.map) (m.map as THREE.Texture).dispose();
          m.dispose();
        });
      }
    });
  }
}
