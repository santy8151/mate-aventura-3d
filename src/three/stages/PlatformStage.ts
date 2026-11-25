import * as THREE from 'three';
import type { PlatformVisualState } from '../../types/game';
import {
  createCloudModel,
  createCoinMesh,
  createCuteTree,
  createHeroModel,
  createMarioCastle,
  createMarioHill,
  createSkyAirship,
  createWarpPipe,
  createWingedBuddy,
} from '../models';
import type { HeroRig } from '../models';
import { ParticleBurstSystem } from '../particles';
import {
  createMarioBrickTexture,
  createMarioSoilTexture,
  createMysteryBlockTexture,
  createSkyDome,
} from '../textures';
import type { StageController } from './WelcomeStage';

const CHECKPOINT_X = [0, 11, 22, 33] as const;
const PIPE_X = [5.5, 16.5, 27.5] as const;
const GOAL_X = 41.5;

export class PlatformStage implements StageController {
  public readonly root = new THREE.Group();
  public readonly skyColor = 0x0284c7;
  public readonly fogColor = 0xbae6fd;
  // Vista 3D en ángulo 3/4 estilo Super Mario 3D World para apreciar volumen y profundidad
  public readonly cameraPos = new THREE.Vector3(2.8, 3.9, 10.6);
  public readonly cameraTarget = new THREE.Vector3(1.8, 1.7, -0.6);

  private hero: HeroRig;
  private mysteryBlocks: THREE.Mesh[] = [];
  private blockBumps: number[] = [0, 0, 0, 0];
  private powerItem: THREE.Group;
  private flagPennant: THREE.Mesh;
  private airship: THREE.Group;
  private wingedBuddies: THREE.Group[] = [];
  private floatingCoins: THREE.Group[] = [];
  private particles = new ParticleBurstSystem();

  private heroX = 0;
  private targetHeroX = 0;
  private isRunning = false;

  private jumpProgress = 1;
  private isJumping = false;
  private heroScale = 1;
  private targetHeroScale = 1;
  private evolutionTier = 0;
  private isEvolved = false;
  private activeStageIndex = 0;
  private itemDropTimer = 0;
  private lastEventTick = -1;
  private failShakeTimer = 0;

  private onHeadScreenPos?: (x: number, y: number) => void;
  private projVec = new THREE.Vector3();

  constructor(onHeadScreenPos?: (x: number, y: number) => void) {
    this.onHeadScreenPos = onHeadScreenPos;
    this.root.add(createSkyDome(0x0284c7, 0xbae6fd));
    this.root.add(this.particles.group);

    // Suelo largo tipo New Super Mario Bros (x = -6 a 50)
    const soilTex = createMarioSoilTexture();
    soilTex.repeat.set(16, 2);
    const brickTex = createMarioBrickTexture();
    const mysteryTex = createMysteryBlockTexture();

    const dirtFloor = new THREE.Mesh(
      new THREE.BoxGeometry(62, 3.6, 6.2),
      new THREE.MeshStandardMaterial({ map: soilTex, roughness: 0.85 })
    );
    dirtFloor.position.set(22, -2.2, 0);
    dirtFloor.receiveShadow = true;
    this.root.add(dirtFloor);

    const grassTop = new THREE.Mesh(
      new THREE.BoxGeometry(62.4, 0.72, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 })
    );
    grassTop.position.set(22, -0.35, 0);
    grassTop.receiveShadow = true;
    this.root.add(grassTop);

    // Franja de césped 3D frontal con brillo
    const turfLip = new THREE.Mesh(
      new THREE.BoxGeometry(62.4, 0.16, 6.65),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.45 })
    );
    turfLip.position.set(22, -0.05, 0);
    this.root.add(turfLip);

    // 4 Estaciones de Reto Mario con bloques de ladrillo y Bloque "?"
    const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.65 });
    const mysteryMat = new THREE.MeshStandardMaterial({ map: mysteryTex, roughness: 0.3 });

    CHECKPOINT_X.forEach((cx) => {
      const leftB = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.98, 0.98), brickMat);
      leftB.position.set(cx - 1.15, 3.45, 0);
      leftB.castShadow = true;
      const rightB = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.98, 0.98), brickMat);
      rightB.position.set(cx + 1.15, 3.45, 0);
      rightB.castShadow = true;
      this.root.add(leftB, rightB);

      const mBlock = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.12, 1.12), mysteryMat);
      mBlock.position.set(cx, 3.48, 0);
      mBlock.castShadow = true;
      this.root.add(mBlock);
      this.mysteryBlocks.push(mBlock);

      // Monedas flotantes entre cada estación
      for (let m = 0; m < 2; m++) {
        const coin = createCoinMesh();
        coin.position.set(cx + 3.2 + m * 1.1, 2.3 + (m % 2) * 0.4, -0.3);
        this.root.add(coin);
        this.floatingCoins.push(coin);
      }
    });

    // Tuberías verdes clásicas con plantas piraña entre las estaciones
    PIPE_X.forEach((px, idx) => {
      const pipe = createWarpPipe(1.55 + (idx % 2) * 0.35, idx === 1);
      pipe.position.set(px, 0, -0.35);
      this.root.add(pipe);
    });

    // Colinas Mario, árboles, nubes, enemigos alados y barco volador en profundidad 3D
    const hillColors = [0x22c55e, 0xfacc15, 0x4ade80, 0x22c55e, 0xfacc15];
    for (let i = 0; i < 6; i++) {
      const hill = createMarioHill(hillColors[i % hillColors.length], 2.8 + (i % 2) * 1.0, 4.4 + (i % 3) * 1.4);
      hill.position.set(-2 + i * 9.5, -0.5, -7.2 - (i % 2) * 2.5);
      this.root.add(hill);

      const tree = createCuteTree(i % 2 === 0 ? 0x16a34a : 0x22c55e, 0.95);
      tree.position.set(i * 9.2 - 3, 0, -2.3);
      this.root.add(tree);

      const cloud = createCloudModel(1.1 + (i % 2) * 0.35);
      cloud.position.set(i * 9.5, 5.4 + (i % 2) * 0.9, -6.5 - (i % 2) * 2);
      this.root.add(cloud);
    }

    // Compañeros/enemigos alados volando en el cielo como en el screenshot de Mario Bros
    [4.5, 15.5, 26.5, 36.5].forEach((bx, idx) => {
      const buddy = createWingedBuddy(idx % 2 === 0 ? 0xef4444 : 0x16a34a);
      buddy.position.set(bx, 4.4 + (idx % 2) * 0.7, -3.2);
      buddy.userData.baseY = buddy.position.y;
      buddy.userData.phase = idx * 1.7;
      this.root.add(buddy);
      this.wingedBuddies.push(buddy);
    });

    this.airship = createSkyAirship(0.85);
    this.airship.position.set(28, 6.6, -12);
    this.root.add(this.airship);

    // Bandera meta + Castillo final de Mario Bros al final del recorrido
    const podium = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.5, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35 })
    );
    podium.position.set(GOAL_X, 0.25, -0.2);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 4.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.25 })
    );
    pole.position.set(GOAL_X, 2.6, -0.2);
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.35 })
    );
    finial.position.set(GOAL_X, 5.05, -0.2);
    this.flagPennant = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.3, 4),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 })
    );
    this.flagPennant.rotation.z = -Math.PI / 2;
    this.flagPennant.position.set(GOAL_X - 0.62, 4.35, -0.2);
    this.root.add(podium, pole, finial, this.flagPennant);

    const castle = createMarioCastle(0.95);
    castle.position.set(GOAL_X + 4.8, 0, -1.6);
    this.root.add(castle);

    // Ítem power-up / corona que sale del bloque "?"
    this.powerItem = new THREE.Group();
    const starCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.75,
        metalness: 0.4,
        roughness: 0.2,
      })
    );
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.06, 8, 24),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x9333ea,
        emissiveIntensity: 0.6,
      })
    );
    this.powerItem.add(starCore, halo);
    this.powerItem.visible = false;
    this.root.add(this.powerItem);

    // Personaje jugador
    this.hero = createHeroModel(false);
    this.hero.root.position.set(0, 0, 0.45);
    this.hero.root.rotation.y = 0.42;
    this.root.add(this.hero.root);
  }

  public syncState(state: PlatformVisualState): void {
    this.activeStageIndex = state.stageIndex;

    if (state.evolutionTier !== this.evolutionTier || state.evolved !== this.isEvolved) {
      this.evolutionTier = state.evolutionTier;
      this.isEvolved = state.evolved;
      this.hero.setEvolutionTier(state.evolved ? 4 : state.evolutionTier);
      const scaleTable = [1.0, 1.1, 1.18, 1.26, 1.38];
      this.targetHeroScale = scaleTable[Math.min(4, state.evolved ? 4 : state.evolutionTier)];
    }

    if (state.evolved) {
      this.targetHeroX = GOAL_X - 1.2;
    } else {
      this.targetHeroX = CHECKPOINT_X[Math.min(3, state.stageIndex)];
    }

    if (state.eventTick === this.lastEventTick) return;
    this.lastEventTick = state.eventTick;

    if (state.event === 'idle') {
      this.isJumping = false;
      this.jumpProgress = 1;
      this.powerItem.visible = false;
      this.heroX = this.targetHeroX;
      this.hero.root.position.x = this.heroX;
      this.heroScale = 1;
      this.targetHeroScale = 1;
      this.hero.root.scale.setScalar(1);
    } else if (state.event === 'jump') {
      this.isJumping = true;
      this.jumpProgress = 0;
      const idx = Math.min(3, this.activeStageIndex);
      this.blockBumps[idx] = 0.28;
      this.particles.burst(
        new THREE.Vector3(this.heroX, 0.25, 0.45),
        [0xffffff, 0xfde047, 0x86efac],
        8,
        3.2
      );
    } else if (state.event === 'bump-fail') {
      this.failShakeTimer = 0.45;
      this.particles.burst(
        new THREE.Vector3(this.heroX, 1.5, 0.45),
        [0xef4444, 0xf97316],
        14,
        4.2
      );
    } else if (state.event === 'advance') {
      const prevIdx = Math.max(0, state.stageIndex - 1);
      const bx = CHECKPOINT_X[prevIdx];
      this.blockBumps[prevIdx] = 0.42;
      this.itemDropTimer = 0.9;
      this.powerItem.visible = true;
      this.powerItem.position.set(bx, 4.3, 0.45);
      this.particles.burst(
        new THREE.Vector3(bx, 2.2, 0.45),
        [0xfacc15, 0x38bdf8, 0x4ade80],
        20,
        5.5
      );
    } else if (state.event === 'evolve') {
      this.blockBumps[3] = 0.45;
      this.itemDropTimer = 1.1;
      this.powerItem.visible = true;
      this.powerItem.position.set(CHECKPOINT_X[3], 4.3, 0.45);
      this.isJumping = true;
      this.jumpProgress = 0;
      this.particles.burst(
        new THREE.Vector3(CHECKPOINT_X[3], 2.2, 0.45),
        [0xfacc15, 0xa855f7, 0x38bdf8, 0xf43f5e],
        38,
        7.2
      );
    }
  }

  public update(dt: number, elapsed: number, camera: THREE.PerspectiveCamera): void {
    this.particles.update(dt);

    // Desplazamiento del héroe hacia el siguiente bloque o hacia la bandera meta
    const dist = this.targetHeroX - this.heroX;
    this.isRunning = Math.abs(dist) > 0.08;
    if (this.isRunning) {
      const step = Math.sign(dist) * Math.min(Math.abs(dist), dt * 6.8);
      this.heroX += step;
    } else {
      this.heroX = this.targetHeroX;
    }

    // Salto automático elegante al pasar por encima de una tubería verde
    let pipeHop = 0;
    if (this.isRunning) {
      for (const px of PIPE_X) {
        const dPipe = Math.abs(this.heroX - px);
        if (dPipe < 1.35) {
          pipeHop = Math.max(pipeHop, Math.cos((dPipe / 1.35) * (Math.PI / 2)) * 2.25);
        }
      }
    }

    // Salto manual del jugador (conteo activo)
    let jumpOffset = 0;
    let sx = 1;
    let sy = 1;
    if (this.isJumping) {
      this.jumpProgress += dt * 3.1;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = 1;
        this.isJumping = false;
      } else {
        const p = this.jumpProgress;
        jumpOffset = Math.sin(p * Math.PI) * 1.55;
        sy = 1 + Math.sin(p * Math.PI) * 0.16;
        sx = 1 - Math.sin(p * Math.PI) * 0.08;
      }
    }

    const totalY = Math.max(jumpOffset, pipeHop);
    this.hero.root.position.x = this.heroX;

    if (this.failShakeTimer > 0) {
      this.failShakeTimer = Math.max(0, this.failShakeTimer - dt);
      this.hero.root.position.x += Math.sin(this.failShakeTimer * 38) * 0.25;
    }

    // Escala evolutiva
    this.heroScale += (this.targetHeroScale - this.heroScale) * Math.min(1, dt * 6);
    this.hero.root.position.y = totalY;
    this.hero.root.scale.set(this.heroScale * sx, this.heroScale * sy, this.heroScale * sx);

    // Animación de correr / saltar / celebrar
    if (this.isRunning) {
      this.hero.root.rotation.y = Math.PI * 0.45;
      this.hero.leftLeg.rotation.x = Math.sin(elapsed * 18) * 0.7;
      this.hero.rightLeg.rotation.x = -Math.sin(elapsed * 18) * 0.7;
      this.hero.leftArm.rotation.x = -Math.sin(elapsed * 18) * 0.65;
      this.hero.rightArm.rotation.x = Math.sin(elapsed * 18) * 0.65;
      this.hero.leftArm.rotation.z = 0.25;
      this.hero.rightArm.rotation.z = -0.25;
    } else {
      this.hero.leftLeg.rotation.x = 0;
      this.hero.rightLeg.rotation.x = 0;
      this.hero.leftArm.rotation.x = 0;
      this.hero.rightArm.rotation.x = 0;
      this.hero.root.rotation.y = this.isEvolved ? 0.22 + Math.sin(elapsed * 2) * 0.22 : 0.32;

      if (this.isJumping) {
        this.hero.leftArm.rotation.z = 2.15;
        this.hero.rightArm.rotation.z = -2.15;
      } else if (this.isEvolved) {
        this.hero.leftArm.rotation.z = 0.6 + Math.sin(elapsed * 5) * 0.25;
        this.hero.rightArm.rotation.z = -0.6 - Math.sin(elapsed * 5) * 0.25;
        this.hero.auraRing.rotation.z = elapsed * 2.6;
      } else {
        this.hero.leftArm.rotation.z = 0.38;
        this.hero.rightArm.rotation.z = -0.38;
      }
    }

    // Cámara 3D sigue suavemente al personaje en ángulo 3/4
    const desiredCamX = this.heroX + 2.6;
    camera.position.x += (desiredCamX - camera.position.x) * Math.min(1, dt * 4.5);
    camera.position.y += (3.9 - camera.position.y) * Math.min(1, dt * 4.5);
    camera.position.z += (10.6 - camera.position.z) * Math.min(1, dt * 4.5);
    camera.lookAt(camera.position.x - 0.8, 1.7, -0.6);

    // Bloques "?" flotantes y rebotes
    this.mysteryBlocks.forEach((b, idx) => {
      if (this.blockBumps[idx] > 0) {
        this.blockBumps[idx] = Math.max(0, this.blockBumps[idx] - dt * 1.6);
      }
      b.position.y = 3.48 + Math.sin(elapsed * 2.5 + idx) * 0.06 + this.blockBumps[idx];
      b.rotation.y = Math.sin(elapsed * 1.2 + idx) * 0.14;
    });

    // Ítem power-up bajando
    if (this.powerItem.visible) {
      this.itemDropTimer = Math.max(0, this.itemDropTimer - dt);
      this.powerItem.rotation.y += dt * 6;
      this.powerItem.position.y = 2.2 + (this.itemDropTimer / 1.1) * 2.0;
      if (this.itemDropTimer === 0) {
        this.powerItem.visible = false;
      }
    }

    // Animaciones de mundo de fondo
    this.flagPennant.rotation.y = Math.sin(elapsed * 5) * 0.18;
    this.airship.position.x = 28 + Math.sin(elapsed * 0.25) * 4;
    this.airship.position.y = 6.6 + Math.sin(elapsed * 1.3) * 0.25;

    this.wingedBuddies.forEach((b) => {
      const ph = b.userData.phase as number;
      b.position.y = (b.userData.baseY as number) + Math.sin(elapsed * 2.6 + ph) * 0.4;
    });

    this.floatingCoins.forEach((c, idx) => {
      c.rotation.y = elapsed * 2.8 + idx;
    });

    // Anclaje en pantalla del contador flotante sobre la cabeza del personaje
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
