import * as THREE from 'three';
import type { OwlVisualState } from '../../types/game';
import {
  createHeroModel,
  createMarioCastle,
  createOwlModel,
  createWonderFlower,
  createWonderTree,
} from '../models';
import type { HeroRig, OwlRig } from '../models';
import { ParticleBurstSystem } from '../particles';
import { createMarioSoilTexture, createSkyDome } from '../textures';
import type { StageController } from './WelcomeStage';

export class OwlStage implements StageController {
  public readonly root = new THREE.Group();
  public readonly skyColor = 0x312e81;
  public readonly fogColor = 0x4338ca;
  public readonly cameraPos = new THREE.Vector3(1.5, 3.5, 9.2);
  public readonly cameraTarget = new THREE.Vector3(0, 1.4, 0);

  private owl: OwlRig;
  private hero: HeroRig;
  private trophy: THREE.Group;
  private wonderFlower: THREE.Group;
  private fireflies: THREE.Mesh[] = [];
  private particles = new ParticleBurstSystem();

  private happyTimer = 0;
  private showTrophy = false;
  private lastEventTick = -1;
  private blinkTimer = 0;

  constructor() {
    this.root.add(createSkyDome(0x1e1b4b, 0x6d28d9));
    this.root.add(this.particles.group);

    const soilTex = createMarioSoilTexture();
    soilTex.repeat.set(4, 2);

    const clearing = new THREE.Mesh(
      new THREE.CylinderGeometry(6.0, 5.7, 0.72, 34),
      new THREE.MeshPhysicalMaterial({ color: 0x22c55e, roughness: 0.55, clearcoat: 0.2 })
    );
    clearing.position.y = -0.35;
    clearing.receiveShadow = true;
    this.root.add(clearing);

    const earth = new THREE.Mesh(
      new THREE.ConeGeometry(5.6, 3.2, 26),
      new THREE.MeshStandardMaterial({ map: soilTex, roughness: 0.9 })
    );
    earth.rotation.x = Math.PI;
    earth.position.y = -2.25;
    this.root.add(earth);

    const t1 = createWonderTree(0.95);
    t1.position.set(-4.1, 0, -2.2);
    const t2 = createWonderTree(0.9);
    t2.position.set(4.1, 0, -2.4);
    const castle = createMarioCastle(0.48);
    castle.position.set(0.1, 0, -4.6);
    this.root.add(t1, t2, castle);

    this.wonderFlower = createWonderFlower(0.75);
    this.wonderFlower.position.set(0, 1.25, -1.8);
    this.root.add(this.wonderFlower);

    const stump = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.2, 0.8, 18),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
    );
    stump.position.set(-1.55, 0.4, 0.2);
    stump.receiveShadow = true;
    this.root.add(stump);

    this.owl = createOwlModel();
    this.owl.root.position.set(-1.55, 0.8, 0.2);
    this.owl.root.rotation.y = 0.26;
    this.root.add(this.owl.root);

    this.hero = createHeroModel(true);
    this.hero.root.position.set(1.75, 0, 0.35);
    this.hero.root.rotation.y = -0.32;
    this.hero.root.scale.setScalar(1.22);
    this.root.add(this.hero.root);

    this.trophy = this.buildTrophyMesh();
    this.trophy.position.set(0, 0.5, 0.6);
    this.trophy.visible = false;
    this.root.add(this.trophy);

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const glowGeo = new THREE.SphereGeometry(0.07, 8, 8);
    for (let i = 0; i < 20; i++) {
      const f = new THREE.Mesh(glowGeo, glowMat);
      f.position.set((Math.random() - 0.5) * 9.5, 0.6 + Math.random() * 3.5, (Math.random() - 0.5) * 5);
      f.userData.phase = Math.random() * Math.PI * 2;
      f.userData.baseY = f.position.y;
      this.root.add(f);
      this.fireflies.push(f);
    }
  }

  private buildTrophyMesh(): THREE.Group {
    const g = new THREE.Group();
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xfacc15,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      metalness: 0.6,
      roughness: 0.16,
      clearcoat: 0.9,
    });
    const medal = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.14, 24), goldMat);
    medal.rotation.x = Math.PI / 2;
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.6 })
    );
    star.position.z = 0.08;
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.65, 0.1),
      new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.3, clearcoat: 0.5 })
    );
    ribbon.position.y = 0.72;
    g.add(medal, star, ribbon);
    return g;
  }

  public syncState(state: OwlVisualState): void {
    this.showTrophy = state.step === 'certificate';
    this.trophy.visible = this.showTrophy;

    if (state.eventTick === this.lastEventTick) return;
    this.lastEventTick = state.eventTick;

    if (state.event === 'happy' || state.event === 'trophy') {
      this.happyTimer = 1.2;
      this.particles.burst(
        new THREE.Vector3(0, 2.2, 0.4),
        [0xfacc15, 0x38bdf8, 0x4ade80, 0xf43f5e],
        state.event === 'trophy' ? 38 : 18,
        6.2
      );
    }
  }

  public update(dt: number, elapsed: number): void {
    this.particles.update(dt);

    this.blinkTimer += dt;
    const isBlinking = this.blinkTimer % 3.4 > 3.22;
    const eyeScaleY = isBlinking ? 0.15 : 1;
    this.owl.leftEye.scale.y = eyeScaleY;
    this.owl.rightEye.scale.y = eyeScaleY;

    this.owl.head.rotation.z = Math.sin(elapsed * 1.9) * 0.08;
    this.owl.head.rotation.y = Math.sin(elapsed * 1.1) * 0.12;

    if (this.happyTimer > 0) {
      this.happyTimer = Math.max(0, this.happyTimer - dt);
      this.owl.leftWing.rotation.z = 0.45 + Math.sin(elapsed * 18) * 0.45;
      this.owl.rightWing.rotation.z = -0.45 - Math.sin(elapsed * 18) * 0.45;
      this.owl.root.position.y = 0.8 + Math.abs(Math.sin(elapsed * 10)) * 0.22;
    } else {
      this.owl.leftWing.rotation.z = 0.18 + Math.sin(elapsed * 2.5) * 0.06;
      this.owl.rightWing.rotation.z = -0.18 - Math.sin(elapsed * 2.5) * 0.06;
      this.owl.root.position.y = 0.8;
    }

    this.wonderFlower.position.y = 1.25 + Math.sin(elapsed * 2.4) * 0.15;
    this.hero.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 2.6)) * 0.09;
    this.hero.auraRing.rotation.z = elapsed * 2.2;

    if (this.showTrophy) {
      this.trophy.rotation.y = elapsed * 2.2;
      this.trophy.position.y = 2.0 + Math.sin(elapsed * 2.8) * 0.15;
    }

    this.fireflies.forEach((f) => {
      const ph = f.userData.phase as number;
      f.position.y = (f.userData.baseY as number) + Math.sin(elapsed * 1.8 + ph) * 0.35;
      f.position.x += Math.sin(elapsed * 0.7 + ph) * 0.002;
    });
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
