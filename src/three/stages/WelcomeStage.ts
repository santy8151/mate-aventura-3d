import * as THREE from 'three';
import {
  createCloudModel,
  createCoinMesh,
  createCuteTree,
  createHeroModel,
  createMarioCastle,
  createOwlModel,
  createSkyAirship,
  createWarpPipe,
} from '../models';
import type { HeroRig, OwlRig } from '../models';
import { createMarioSoilTexture, createMysteryBlockTexture, createSkyDome } from '../textures';

export interface StageController {
  root: THREE.Group;
  skyColor: number;
  fogColor: number;
  cameraPos: THREE.Vector3;
  cameraTarget: THREE.Vector3;
  update: (dt: number, elapsed: number, camera: THREE.PerspectiveCamera) => void;
  dispose: () => void;
  handlePointerClick?: (raycaster: THREE.Raycaster) => void;
}

export class WelcomeStage implements StageController {
  public readonly root = new THREE.Group();
  public readonly skyColor = 0x0284c7;
  public readonly fogColor = 0xbae6fd;
  public readonly cameraPos = new THREE.Vector3(3.4, 4.4, 10.8);
  public readonly cameraTarget = new THREE.Vector3(0, -0.3, 0);

  private island = new THREE.Group();
  private hero: HeroRig;
  private owl: OwlRig;
  private airship: THREE.Group;
  private coins: THREE.Group[] = [];
  private clouds: THREE.Group[] = [];

  constructor() {
    this.root.add(createSkyDome(0x0284c7, 0xbae6fd));
    this.root.add(this.island);

    // Isla 3D texturizada estilo Mario
    const soilTex = createMarioSoilTexture();
    soilTex.repeat.set(3, 1.5);

    const grass = new THREE.Mesh(
      new THREE.CylinderGeometry(5.1, 4.8, 0.72, 32),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 })
    );
    grass.position.y = -0.35;
    grass.receiveShadow = true;
    this.island.add(grass);

    const earth = new THREE.Mesh(
      new THREE.ConeGeometry(4.7, 3.2, 24),
      new THREE.MeshStandardMaterial({ map: soilTex, roughness: 0.85 })
    );
    earth.rotation.x = Math.PI;
    earth.position.y = -2.25;
    this.island.add(earth);

    // Elementos icónicos Mario / Nintendo en la isla
    const pipe = createWarpPipe(1.25, true);
    pipe.position.set(-3.2, 0, -1.3);
    const mystery = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.95, 0.95),
      new THREE.MeshStandardMaterial({ map: createMysteryBlockTexture(), roughness: 0.35 })
    );
    mystery.position.set(-0.1, 2.7, -1.1);
    mystery.castShadow = true;

    const castle = createMarioCastle(0.38);
    castle.position.set(0.2, 0, -3.1);

    const treeL = createCuteTree(0x16a34a, 0.95);
    treeL.position.set(-2.4, 0, -2.6);
    const treeR = createCuteTree(0x4ade80, 0.85);
    treeR.position.set(3.2, 0, -1.8);
    this.island.add(pipe, mystery, castle, treeL, treeR);

    // Héroe y Búho
    this.hero = createHeroModel(false);
    this.hero.root.position.set(-1.4, 0, 1.2);
    this.hero.root.rotation.y = 0.45;
    this.island.add(this.hero.root);

    const stump = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.98, 0.65, 16),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
    );
    stump.position.set(1.85, 0.32, 0.8);
    stump.receiveShadow = true;
    this.island.add(stump);

    this.owl = createOwlModel();
    this.owl.root.position.set(1.85, 0.65, 0.8);
    this.owl.root.rotation.y = -0.35;
    this.owl.root.scale.setScalar(0.85);
    this.island.add(this.owl.root);

    // Monedas giratorias
    for (let i = 0; i < 4; i++) {
      const coin = createCoinMesh();
      const angle = (i / 4) * Math.PI * 2;
      coin.position.set(Math.cos(angle) * 3.5, 2.1 + (i % 2) * 0.35, Math.sin(angle) * 2.4);
      this.island.add(coin);
      this.coins.push(coin);
    }

    // Barco volador y nubes de fondo
    this.airship = createSkyAirship(0.65);
    this.airship.position.set(-6.5, 5.2, -9);
    this.root.add(this.airship);

    const c1 = createCloudModel(1.25);
    c1.position.set(-5.8, 3.8, -5.5);
    const c2 = createCloudModel(1.0);
    c2.position.set(5.8, 4.4, -6.2);
    this.root.add(c1, c2);
    this.clouds.push(c1, c2);
  }

  public update(_dt: number, elapsed: number): void {
    this.island.rotation.y = Math.sin(elapsed * 0.35) * 0.14;
    this.island.position.y = Math.sin(elapsed * 1.4) * 0.1;

    this.hero.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 3.2)) * 0.15;
    this.hero.rightArm.rotation.z = -0.5 - Math.sin(elapsed * 6) * 0.45;
    this.hero.cape.rotation.x = 0.25 + Math.sin(elapsed * 4) * 0.08;

    this.owl.head.rotation.z = Math.sin(elapsed * 1.8) * 0.09;
    this.owl.leftWing.rotation.z = 0.22 + Math.sin(elapsed * 3.2) * 0.14;
    this.owl.rightWing.rotation.z = -0.22 - Math.sin(elapsed * 3.2) * 0.14;

    this.airship.position.x = -6.5 + Math.sin(elapsed * 0.25) * 2.2;
    this.airship.position.y = 5.2 + Math.sin(elapsed * 1.4) * 0.22;

    this.coins.forEach((c, idx) => {
      c.rotation.y = elapsed * 2.6 + idx;
      c.position.y = 2.1 + Math.sin(elapsed * 2.4 + idx) * 0.22;
    });

    this.clouds.forEach((c, idx) => {
      c.position.y += Math.sin(elapsed * 1.1 + idx * 2) * 0.002;
    });
  }

  public dispose(): void {
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
