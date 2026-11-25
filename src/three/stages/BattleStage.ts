import * as THREE from 'three';
import type { BattleVisualState } from '../../types/game';
import {
  createCloudModel,
  createCuteTree,
  createHeroModel,
  createMarioCastle,
  createMarioHill,
  createSkyAirship,
  createVillainModel,
} from '../models';
import type { HeroRig, VillainRig } from '../models';
import { ParticleBurstSystem } from '../particles';
import { createArenaStoneTexture, createMarioSoilTexture, createSkyDome } from '../textures';
import type { StageController } from './WelcomeStage';

export class BattleStage implements StageController {
  public readonly root = new THREE.Group();
  public readonly skyColor = 0x0284c7;
  public readonly fogColor = 0xbae6fd;
  // Vista 3/4 angular cinematográfica (evita sensación 2D plana)
  public readonly cameraPos = new THREE.Vector3(-2.1, 4.7, 10.6);
  public readonly cameraTarget = new THREE.Vector3(0.2, 1.35, 0);

  private hero: HeroRig;
  private villain: VillainRig;
  private airship: THREE.Group;
  private particles = new ParticleBurstSystem();

  private projectile: THREE.Mesh;
  private projectileActive = false;
  private projectileProgress = 0;
  private projectileFrom = new THREE.Vector3();
  private projectileTo = new THREE.Vector3();
  private projectileFromHero = true;

  private heroHitTimer = 0;
  private villainHitTimer = 0;
  private heroLungeTimer = 0;
  private villainLungeTimer = 0;
  private defeated = false;
  private defeatTimer = 0;
  private lastEventTick = -1;

  private readonly heroBaseX = -3.1;
  private readonly villainBaseX = 3.1;

  constructor() {
    this.root.add(createSkyDome(0x0284c7, 0xbae6fd));
    this.root.add(this.particles.group);

    // Arena Coliseo 3D texturizada
    const stoneTex = createArenaStoneTexture();
    stoneTex.repeat.set(2, 2);
    const soilTex = createMarioSoilTexture();
    soilTex.repeat.set(4, 2);

    const arenaTop = new THREE.Mesh(
      new THREE.CylinderGeometry(5.9, 5.7, 0.7, 34),
      new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.6 })
    );
    arenaTop.scale.set(1.18, 1, 0.88);
    arenaTop.position.y = -0.35;
    arenaTop.receiveShadow = true;
    this.root.add(arenaTop);

    const arenaRim = new THREE.Mesh(
      new THREE.TorusGeometry(5.85, 0.28, 12, 42),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.2 })
    );
    arenaRim.rotation.x = Math.PI / 2;
    arenaRim.scale.set(1.18, 0.88, 1);
    arenaRim.position.y = -0.02;
    this.root.add(arenaRim);

    const earth = new THREE.Mesh(
      new THREE.ConeGeometry(5.6, 3.4, 26),
      new THREE.MeshStandardMaterial({ map: soilTex, roughness: 0.9 })
    );
    earth.rotation.x = Math.PI;
    earth.scale.set(1.18, 1, 0.88);
    earth.position.y = -2.3;
    this.root.add(earth);

    // Pilares de cristal del coliseo
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
    });
    [
      [-5.1, -2.5],
      [5.1, -2.5],
      [-2.5, -4.1],
      [2.5, -4.1],
    ].forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 2.2, 12), pillarMat);
      col.position.set(px, 1.1, pz);
      col.castShadow = true;
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), crystalMat);
      gem.position.set(px, 2.55, pz);
      this.root.add(col, gem);
    });

    // Bases luminosas
    const heroPad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.35, 0.16, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4,
      })
    );
    heroPad.position.set(this.heroBaseX, 0.08, 0);
    this.root.add(heroPad);

    const villainPad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.45, 0.16, 24),
      new THREE.MeshStandardMaterial({
        color: 0xc084fc,
        emissive: 0x9333ea,
        emissiveIntensity: 0.4,
      })
    );
    villainPad.position.set(this.villainBaseX, 0.08, 0);
    this.root.add(villainPad);

    // Fondo escenográfico Nintendo: colinas, castillo, árboles, barco volador
    const hillL = createMarioHill(0x22c55e, 3.2, 5.2);
    hillL.position.set(-7.5, -1.5, -10);
    const hillR = createMarioHill(0x4ade80, 2.8, 4.4);
    hillR.position.set(7.8, -1.5, -11);
    const castle = createMarioCastle(0.65);
    castle.position.set(0.2, 0.2, -13);
    const t1 = createCuteTree(0x22c55e, 0.95);
    t1.position.set(-4.3, 0, -2.4);
    const t2 = createCuteTree(0x16a34a, 0.9);
    t2.position.set(4.3, 0, -2.4);
    const c1 = createCloudModel(1.2);
    c1.position.set(-5.8, 4.6, -5.2);
    const c2 = createCloudModel(1.0);
    c2.position.set(5.8, 5.0, -5.8);

    this.airship = createSkyAirship(0.65);
    this.airship.position.set(6.4, 5.5, -10);
    this.root.add(hillL, hillR, castle, t1, t2, c1, c2, this.airship);

    // Héroe y Villano
    this.hero = createHeroModel(false);
    this.hero.root.position.set(this.heroBaseX, 0.14, 0);
    this.hero.root.rotation.y = Math.PI * 0.44;
    this.root.add(this.hero.root);

    this.villain = createVillainModel();
    this.villain.root.position.set(this.villainBaseX, 0.14, 0);
    this.villain.root.rotation.y = -Math.PI * 0.44;
    this.root.add(this.villain.root);

    this.projectile = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 1),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
      })
    );
    this.projectile.visible = false;
    this.root.add(this.projectile);
  }

  public syncState(state: BattleVisualState): void {
    if (state.eventTick === this.lastEventTick) return;
    this.lastEventTick = state.eventTick;

    if (state.event === 'idle') {
      this.defeated = false;
      this.defeatTimer = 0;
      this.villain.root.visible = true;
      this.villain.root.scale.setScalar(1);
      this.villain.root.rotation.y = -Math.PI * 0.44;
      return;
    }

    if (state.event === 'hero-attack' || state.event === 'villain-defeated') {
      this.heroLungeTimer = 0.35;
      this.launchProjectile(true);
      if (state.event === 'villain-defeated') {
        this.defeated = true;
        this.defeatTimer = 0;
      }
    } else if (state.event === 'villain-attack') {
      this.villainLungeTimer = 0.35;
      this.launchProjectile(false);
    }
  }

  private launchProjectile(fromHero: boolean): void {
    this.projectileActive = true;
    this.projectileProgress = 0;
    this.projectileFromHero = fromHero;

    const mat = this.projectile.material as THREE.MeshStandardMaterial;
    if (fromHero) {
      mat.color.setHex(0xfde047);
      mat.emissive.setHex(0x38bdf8);
      this.projectileFrom.set(this.heroBaseX + 0.8, 1.5, 0);
      this.projectileTo.set(this.villainBaseX - 0.3, 1.4, 0);
    } else {
      mat.color.setHex(0xe879f9);
      mat.emissive.setHex(0x9333ea);
      this.projectileFrom.set(this.villainBaseX - 0.8, 1.5, 0);
      this.projectileTo.set(this.heroBaseX + 0.3, 1.4, 0);
    }

    this.projectile.position.copy(this.projectileFrom);
    this.projectile.visible = true;
  }

  public update(dt: number, elapsed: number): void {
    this.particles.update(dt);

    this.airship.position.x = 6.4 - Math.sin(elapsed * 0.28) * 2.5;
    this.airship.position.y = 5.5 + Math.sin(elapsed * 1.4) * 0.2;

    const idleBounce = Math.sin(elapsed * 4.2) * 0.08;
    this.hero.bodyGroup.position.y = idleBounce;
    this.hero.cape.rotation.x = 0.25 + Math.sin(elapsed * 5) * 0.08;

    if (this.heroLungeTimer > 0) {
      this.heroLungeTimer = Math.max(0, this.heroLungeTimer - dt);
      const t = Math.sin((this.heroLungeTimer / 0.35) * Math.PI);
      this.hero.root.position.x = this.heroBaseX + t * 0.9;
      this.hero.root.position.y = 0.14 + t * 0.55;
      this.hero.rightArm.rotation.z = -1.3;
    } else if (this.heroHitTimer > 0) {
      this.heroHitTimer = Math.max(0, this.heroHitTimer - dt);
      const t = this.heroHitTimer / 0.45;
      this.hero.root.position.x = this.heroBaseX - Math.sin(t * Math.PI) * 0.65;
      this.hero.root.rotation.z = Math.sin(t * 24) * 0.14;
    } else {
      this.hero.root.position.x = this.heroBaseX;
      this.hero.root.position.y = this.defeated ? 0.14 + Math.abs(Math.sin(elapsed * 6)) * 0.45 : 0.14;
      this.hero.root.rotation.z = 0;
      this.hero.rightArm.rotation.z = -0.38;
    }

    this.villain.hoverRing.rotation.z = elapsed * 2.5;
    this.villain.body.position.y = 1.32 + Math.sin(elapsed * 3.1) * 0.14;

    if (this.villainLungeTimer > 0) {
      this.villainLungeTimer = Math.max(0, this.villainLungeTimer - dt);
      const t = Math.sin((this.villainLungeTimer / 0.35) * Math.PI);
      this.villain.root.position.x = this.villainBaseX - t * 0.85;
    } else if (this.villainHitTimer > 0) {
      this.villainHitTimer = Math.max(0, this.villainHitTimer - dt);
      const t = this.villainHitTimer / 0.45;
      this.villain.root.position.x = this.villainBaseX + Math.sin(t * Math.PI) * 0.75;
      this.villain.root.rotation.z = -Math.sin(t * 28) * 0.2;
      this.villain.bodyMat.emissive.setHex(t > 0.2 ? 0xef4444 : 0x000000);
      this.villain.bodyMat.emissiveIntensity = t > 0.2 ? 0.65 : 0;
    } else {
      this.villain.root.position.x = this.villainBaseX;
      this.villain.root.rotation.z = 0;
      this.villain.bodyMat.emissive.setHex(0x000000);
      this.villain.bodyMat.emissiveIntensity = 0;
    }

    if (this.defeated && !this.projectileActive) {
      this.defeatTimer += dt;
      if (this.defeatTimer < 1.1) {
        const s = Math.max(0.01, 1 - this.defeatTimer / 1.1);
        this.villain.root.scale.setScalar(s);
        this.villain.root.rotation.y += dt * 14;
        this.villain.root.position.y = 0.14 + this.defeatTimer * 1.4;
      } else {
        this.villain.root.visible = false;
      }
    }

    if (this.projectileActive) {
      this.projectileProgress += dt * 3.1;
      const p = Math.min(1, this.projectileProgress);
      this.projectile.position.lerpVectors(this.projectileFrom, this.projectileTo, p);
      this.projectile.position.y += Math.sin(p * Math.PI) * 0.9;
      this.projectile.rotation.x += dt * 14;
      this.projectile.rotation.y += dt * 14;

      if (p >= 1) {
        this.projectileActive = false;
        this.projectile.visible = false;
        if (this.projectileFromHero) {
          this.villainHitTimer = 0.45;
          this.particles.burst(
            new THREE.Vector3(this.villainBaseX, 1.4, 0),
            this.defeated ? [0xfacc15, 0x38bdf8, 0xf43f5e, 0x4ade80] : [0xfacc15, 0x38bdf8, 0xffffff],
            this.defeated ? 34 : 20,
            this.defeated ? 7 : 5.2
          );
        } else {
          this.heroHitTimer = 0.45;
          this.particles.burst(
            new THREE.Vector3(this.heroBaseX, 1.3, 0),
            [0xc084fc, 0xf43f5e, 0xfef08a],
            16,
            4.6
          );
        }
      }
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
