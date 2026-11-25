import * as THREE from 'three';
import type { AllyId, BattleVisualState } from '../../types/game';
import {
  createAllyModel,
  createBossVillainModel,
  createCloudModel,
  createHeroModel,
  createMarioCastle,
  createMarioHill,
  createRainbowArch,
  createSkyAirship,
  createWonderTree,
} from '../models';
import type { HeroRig, VillainRig } from '../models';
import { ParticleBurstSystem } from '../particles';
import { createArenaStoneTexture, createMarioSoilTexture, createSkyDome } from '../textures';
import type { StageController } from './WelcomeStage';

export class BattleStage implements StageController {
  public readonly root = new THREE.Group();
  public readonly skyColor = 0x0284c7;
  public readonly fogColor = 0xbae6fd;
  // Vista 3/4 coliseo para apreciar al Héroe, Aliado con Escudo y Jefe Gigante
  public readonly cameraPos = new THREE.Vector3(-2.3, 5.2, 12.0);
  public readonly cameraTarget = new THREE.Vector3(0.4, 1.65, 0);

  private hero: HeroRig;
  private allyGroup = new THREE.Group();
  private allyMesh: THREE.Group | null = null;
  private currentAllyId: AllyId = 'dino';
  private shieldDome: THREE.Mesh;

  private villain: VillainRig;
  private airship: THREE.Group;
  private particles = new ParticleBurstSystem();

  private projectile: THREE.Mesh;
  private allyProjectile: THREE.Mesh;
  private projectileActive = false;
  private projectileProgress = 0;
  private projectileFrom = new THREE.Vector3();
  private projectileTo = new THREE.Vector3();
  private projectileKind: 'hero' | 'boss-hit' | 'boss-blocked' = 'hero';

  private heroHitTimer = 0;
  private allyBlockTimer = 0;
  private villainHitTimer = 0;
  private heroLungeTimer = 0;
  private villainLungeTimer = 0;
  private defeated = false;
  private defeatTimer = 0;
  private lastEventTick = -1;

  private readonly heroBaseX = -3.9;
  private readonly allyBaseX = -1.9;
  private readonly villainBaseX = 3.35;

  constructor() {
    this.root.add(createSkyDome(0x0284c7, 0xbae6fd));
    this.root.add(this.particles.group);

    const stoneTex = createArenaStoneTexture();
    stoneTex.repeat.set(2.5, 2.5);
    const soilTex = createMarioSoilTexture();
    soilTex.repeat.set(4, 2);

    const arenaTop = new THREE.Mesh(
      new THREE.CylinderGeometry(6.6, 6.4, 0.72, 38),
      new THREE.MeshPhysicalMaterial({ map: stoneTex, roughness: 0.45, clearcoat: 0.25 })
    );
    arenaTop.scale.set(1.22, 1, 0.88);
    arenaTop.position.y = -0.36;
    arenaTop.receiveShadow = true;
    this.root.add(arenaTop);

    const arenaRim = new THREE.Mesh(
      new THREE.TorusGeometry(6.55, 0.3, 12, 48),
      new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.35, clearcoat: 0.6 })
    );
    arenaRim.rotation.x = Math.PI / 2;
    arenaRim.scale.set(1.22, 0.88, 1);
    arenaRim.position.y = -0.02;
    this.root.add(arenaRim);

    const earth = new THREE.Mesh(
      new THREE.ConeGeometry(6.2, 3.6, 28),
      new THREE.MeshStandardMaterial({ map: soilTex, roughness: 0.9 })
    );
    earth.rotation.x = Math.PI;
    earth.scale.set(1.22, 1, 0.88);
    earth.position.y = -2.4;
    this.root.add(earth);

    // Pilares de cristal del coliseo
    const pillarMat = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc, roughness: 0.4, clearcoat: 0.3 });
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      clearcoat: 0.9,
    });
    [
      [-5.8, -2.9],
      [5.8, -2.9],
      [-2.8, -4.5],
      [2.8, -4.5],
    ].forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.44, 2.4, 14), pillarMat);
      col.position.set(px, 1.2, pz);
      col.castShadow = true;
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), crystalMat);
      gem.position.set(px, 2.8, pz);
      this.root.add(col, gem);
    });

    // Bases luminosas
    const heroPad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.4, 0.16, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 })
    );
    heroPad.position.set(this.heroBaseX, 0.08, 0);
    const allyPad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.15, 0.16, 24),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 0.4 })
    );
    allyPad.position.set(this.allyBaseX, 0.08, 0.75);
    const bossPad = new THREE.Mesh(
      new THREE.CylinderGeometry(2.05, 2.2, 0.22, 28),
      new THREE.MeshStandardMaterial({ color: 0xc026d3, emissive: 0x9333ea, emissiveIntensity: 0.45 })
    );
    bossPad.position.set(this.villainBaseX, 0.11, -0.1);
    this.root.add(heroPad, allyPad, bossPad);

    // Escenografía Nintendo Wonder de fondo
    const rainbow = createRainbowArch(18);
    rainbow.position.set(0, -1, -20);
    const hillL = createMarioHill(0x22c55e, 3.6, 5.8);
    hillL.position.set(-8.8, -1.5, -12);
    const hillR = createMarioHill(0x4ade80, 3.2, 5.0);
    hillR.position.set(9.0, -1.5, -13);
    const castle = createMarioCastle(0.72);
    castle.position.set(0.2, 0.2, -15);
    const t1 = createWonderTree(0.85);
    t1.position.set(-5.0, 0, -2.8);
    const t2 = createWonderTree(0.8);
    t2.position.set(5.2, 0, -2.8);
    const c1 = createCloudModel(1.3);
    c1.position.set(-6.4, 5.2, -6.0);
    const c2 = createCloudModel(1.1);
    c2.position.set(6.4, 5.6, -6.8);

    this.airship = createSkyAirship(0.75);
    this.airship.position.set(6.8, 6.2, -11);
    this.root.add(rainbow, hillL, hillR, castle, t1, t2, c1, c2, this.airship);

    // Héroe
    this.hero = createHeroModel(false);
    this.hero.root.position.set(this.heroBaseX, 0.14, 0);
    this.hero.root.rotation.y = Math.PI * 0.44;
    this.root.add(this.hero.root);

    // Aliado + Escudo protector 3D
    this.allyGroup.position.set(this.allyBaseX, 0.14, 0.75);
    this.allyGroup.rotation.y = Math.PI * 0.4;
    this.root.add(this.allyGroup);
    this.setAllyModel('dino');

    this.shieldDome = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 24, 18, 0, Math.PI, 0, Math.PI),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.34,
        roughness: 0.1,
        clearcoat: 1,
        side: THREE.DoubleSide,
      })
    );
    this.shieldDome.rotation.y = Math.PI * 0.5;
    this.shieldDome.position.set(this.allyBaseX + 0.55, 1.15, 0.45);
    this.root.add(this.shieldDome);

    // Jefe Villano Gigante y Poderoso
    this.villain = createBossVillainModel();
    this.villain.root.position.set(this.villainBaseX, 0.16, -0.1);
    this.villain.root.rotation.y = -Math.PI * 0.44;
    this.root.add(this.villain.root);

    // Proyectiles de combate (Héroe y Aliado)
    this.projectile = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.5, 1),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.95 })
    );
    this.projectile.visible = false;
    this.allyProjectile = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.36, 1),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.95 })
    );
    this.allyProjectile.visible = false;
    this.root.add(this.projectile, this.allyProjectile);
  }

  private setAllyModel(allyId: AllyId): void {
    if (this.allyMesh) {
      this.allyGroup.remove(this.allyMesh);
      this.allyMesh.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
    }
    this.currentAllyId = allyId;
    this.allyMesh = createAllyModel(allyId);
    this.allyGroup.add(this.allyMesh);
  }

  public syncState(state: BattleVisualState): void {
    if (state.activeAlly !== this.currentAllyId) {
      this.setAllyModel(state.activeAlly);
      this.particles.burst(
        new THREE.Vector3(this.allyBaseX, 1.2, 0.75),
        [0x4ade80, 0x38bdf8, 0xfacc15],
        20,
        5.0
      );
    }

    this.shieldDome.visible = state.shieldActive && !this.defeated;

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
      this.heroLungeTimer = 0.38;
      this.launchProjectile('hero');
      if (state.event === 'villain-defeated') {
        this.defeated = true;
        this.defeatTimer = 0;
      }
    } else if (state.event === 'ally-block') {
      this.villainLungeTimer = 0.4;
      this.launchProjectile('boss-blocked');
    } else if (state.event === 'villain-attack') {
      this.villainLungeTimer = 0.4;
      this.launchProjectile('boss-hit');
    }
  }

  private launchProjectile(kind: 'hero' | 'boss-hit' | 'boss-blocked'): void {
    this.projectileActive = true;
    this.projectileProgress = 0;
    this.projectileKind = kind;

    const mat = this.projectile.material as THREE.MeshStandardMaterial;
    if (kind === 'hero') {
      mat.color.setHex(0xfde047);
      mat.emissive.setHex(0x38bdf8);
      this.projectileFrom.set(this.heroBaseX + 0.8, 1.5, 0);
      this.projectileTo.set(this.villainBaseX - 0.8, 2.0, -0.1);
      this.allyProjectile.visible = true;
      this.allyProjectile.position.set(this.allyBaseX + 0.6, 1.2, 0.75);
    } else if (kind === 'boss-blocked') {
      mat.color.setHex(0xf97316);
      mat.emissive.setHex(0xc026d3);
      this.projectileFrom.set(this.villainBaseX - 1.2, 2.1, -0.1);
      this.projectileTo.set(this.allyBaseX + 0.65, 1.25, 0.5);
      this.allyProjectile.visible = false;
    } else {
      mat.color.setHex(0xe879f9);
      mat.emissive.setHex(0xdc2626);
      this.projectileFrom.set(this.villainBaseX - 1.2, 2.1, -0.1);
      this.projectileTo.set(this.heroBaseX + 0.4, 1.35, 0);
      this.allyProjectile.visible = false;
    }

    this.projectile.position.copy(this.projectileFrom);
    this.projectile.visible = true;
  }

  public update(dt: number, elapsed: number): void {
    this.particles.update(dt);

    this.airship.position.x = 6.8 - Math.sin(elapsed * 0.28) * 2.5;
    this.airship.position.y = 6.2 + Math.sin(elapsed * 1.4) * 0.2;

    // Héroe
    const idleBounce = Math.sin(elapsed * 4.2) * 0.08;
    this.hero.bodyGroup.position.y = idleBounce;
    this.hero.cape.rotation.x = 0.25 + Math.sin(elapsed * 5) * 0.08;

    if (this.heroLungeTimer > 0) {
      this.heroLungeTimer = Math.max(0, this.heroLungeTimer - dt);
      const t = Math.sin((this.heroLungeTimer / 0.38) * Math.PI);
      this.hero.root.position.x = this.heroBaseX + t * 0.9;
      this.hero.root.position.y = 0.14 + t * 0.55;
      this.hero.rightArm.rotation.z = -1.3;
    } else if (this.heroHitTimer > 0) {
      this.heroHitTimer = Math.max(0, this.heroHitTimer - dt);
      const t = this.heroHitTimer / 0.45;
      this.hero.root.position.x = this.heroBaseX - Math.sin(t * Math.PI) * 0.7;
      this.hero.root.rotation.z = Math.sin(t * 24) * 0.16;
    } else {
      this.hero.root.position.x = this.heroBaseX;
      this.hero.root.position.y = this.defeated ? 0.14 + Math.abs(Math.sin(elapsed * 6)) * 0.45 : 0.14;
      this.hero.root.rotation.z = 0;
      this.hero.rightArm.rotation.z = -0.38;
    }

    // Aliado + Escudo protector
    if (this.allyBlockTimer > 0) {
      this.allyBlockTimer = Math.max(0, this.allyBlockTimer - dt);
      const t = Math.sin((this.allyBlockTimer / 0.45) * Math.PI);
      this.allyGroup.position.y = 0.14 + t * 0.65;
      this.allyGroup.position.x = this.allyBaseX + t * 0.45;
    } else {
      this.allyGroup.position.y = 0.14 + Math.abs(Math.sin(elapsed * 3.8)) * 0.12;
      this.allyGroup.position.x = this.allyBaseX;
    }

    if (this.shieldDome.visible) {
      const pulse = 1 + Math.sin(elapsed * 4.5) * 0.04;
      this.shieldDome.scale.setScalar(pulse);
    }

    // Jefe Gigante
    this.villain.hoverRing.rotation.z = elapsed * 2.5;
    this.villain.coreMesh.rotation.y = elapsed * 3.2;
    this.villain.body.position.y = 1.95 + Math.sin(elapsed * 2.8) * 0.18;

    if (this.villainLungeTimer > 0) {
      this.villainLungeTimer = Math.max(0, this.villainLungeTimer - dt);
      const t = Math.sin((this.villainLungeTimer / 0.4) * Math.PI);
      this.villain.root.position.x = this.villainBaseX - t * 1.05;
    } else if (this.villainHitTimer > 0) {
      this.villainHitTimer = Math.max(0, this.villainHitTimer - dt);
      const t = this.villainHitTimer / 0.45;
      this.villain.root.position.x = this.villainBaseX + Math.sin(t * Math.PI) * 0.75;
      this.villain.root.rotation.z = -Math.sin(t * 28) * 0.18;
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
      if (this.defeatTimer < 1.2) {
        const s = Math.max(0.01, 1 - this.defeatTimer / 1.2);
        this.villain.root.scale.setScalar(s);
        this.villain.root.rotation.y += dt * 14;
        this.villain.root.position.y = 0.16 + this.defeatTimer * 1.6;
      } else {
        this.villain.root.visible = false;
      }
    }

    if (this.projectileActive) {
      this.projectileProgress += dt * 3.1;
      const p = Math.min(1, this.projectileProgress);
      this.projectile.position.lerpVectors(this.projectileFrom, this.projectileTo, p);
      this.projectile.position.y += Math.sin(p * Math.PI) * 0.95;
      this.projectile.rotation.x += dt * 14;
      this.projectile.rotation.y += dt * 14;

      if (this.allyProjectile.visible) {
        this.allyProjectile.position.lerpVectors(
          new THREE.Vector3(this.allyBaseX + 0.6, 1.2, 0.75),
          this.projectileTo,
          p
        );
        this.allyProjectile.position.y += Math.sin(p * Math.PI) * 0.6;
        this.allyProjectile.rotation.y += dt * 16;
      }

      if (p >= 1) {
        this.projectileActive = false;
        this.projectile.visible = false;
        this.allyProjectile.visible = false;

        if (this.projectileKind === 'hero') {
          this.villainHitTimer = 0.45;
          this.particles.burst(
            new THREE.Vector3(this.villainBaseX, 2.0, -0.1),
            this.defeated ? [0xfacc15, 0x38bdf8, 0xf43f5e, 0x4ade80] : [0xfacc15, 0x38bdf8, 0xffffff],
            this.defeated ? 44 : 26,
            this.defeated ? 7.8 : 5.8
          );
        } else if (this.projectileKind === 'boss-blocked') {
          this.allyBlockTimer = 0.45;
          this.particles.burst(
            new THREE.Vector3(this.allyBaseX + 0.65, 1.3, 0.5),
            [0x38bdf8, 0x4ade80, 0xfacc15, 0xffffff],
            28,
            6.2
          );
        } else {
          this.heroHitTimer = 0.45;
          this.particles.burst(
            new THREE.Vector3(this.heroBaseX, 1.3, 0),
            [0xc084fc, 0xf43f5e, 0xfef08a],
            20,
            5.0
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
