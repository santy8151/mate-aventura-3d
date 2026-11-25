import * as THREE from 'three';
import type { LaneIndex, RaceVisualState } from '../../types/game';
import {
  createCloudModel,
  createCuteTree,
  createKartModel,
  createMarioCastle,
  createMarioHill,
  createWarpPipe,
} from '../models';
import type { KartRig } from '../models';
import { ParticleBurstSystem } from '../particles';
import {
  createCheckerTexture,
  createNumberSignTexture,
  createRoadAsphaltTexture,
  createSkyDome,
} from '../textures';
import type { StageController } from './WelcomeStage';

const LANE_X: readonly [number, number, number] = [-3.1, 0, 3.1];

export class RaceStage implements StageController {
  public readonly root = new THREE.Group();
  public readonly skyColor = 0x0284c7;
  public readonly fogColor = 0xbae6fd;
  // Cámara 3D Mario Kart clara y elevada para ver kart + pista + portales sin tapar con controles
  public readonly cameraPos = new THREE.Vector3(0, 4.9, 11.2);
  public readonly cameraTarget = new THREE.Vector3(0, 0.55, -4.5);

  private kart: KartRig;
  private currentLane: LaneIndex = 1;
  private kartX = 0;
  private particles = new ParticleBurstSystem();

  private roadTex: THREE.CanvasTexture;
  private stripes: THREE.Mesh[] = [];
  private roadsideProps: THREE.Group[] = [];
  private stadiumArches: THREE.Group[] = [];
  private laneHighlight: THREE.Mesh;
  private laneHitPlanes: THREE.Mesh[] = [];

  private portalGroup = new THREE.Group();
  private portalSignMeshes: THREE.Mesh[] = [];
  private currentPortalOptions: [number, number, number] = [0, 0, 0];
  private portalDistance = 1;

  private finishArch: THREE.Group;
  private isFinished = false;
  private turboFlashTimer = 0;
  private crashTimer = 0;
  private lastEventTick = -1;
  private onSelectLane?: (lane: LaneIndex) => void;

  constructor(onSelectLane?: (lane: LaneIndex) => void) {
    this.onSelectLane = onSelectLane;
    this.root.add(createSkyDome(0x0284c7, 0xbae6fd));
    this.root.add(this.particles.group);

    // Pradera verde de circuito
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.06, -30);
    ground.receiveShadow = true;
    this.root.add(ground);

    // Autopista con textura asfáltica animada y líneas Mario Kart
    this.roadTex = createRoadAsphaltTexture();
    this.roadTex.repeat.set(1, 14);
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(10.8, 0.2, 100),
      new THREE.MeshStandardMaterial({ map: this.roadTex, roughness: 0.65 })
    );
    road.position.set(0, -0.05, -28);
    road.receiveShadow = true;
    this.root.add(road);

    // Bordillos rojo-blanco Mario Kart
    for (let z = -70; z <= 14; z += 4) {
      const isRed = Math.abs(Math.floor(z / 4)) % 2 === 0;
      const curbMat = new THREE.MeshStandardMaterial({
        color: isRed ? 0xef4444 : 0xffffff,
        roughness: 0.4,
      });
      const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.3, 3.9), curbMat);
      leftCurb.position.set(-5.65, 0.06, z);
      const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.3, 3.9), curbMat);
      rightCurb.position.set(5.65, 0.06, z);
      this.root.add(leftCurb, rightCurb);
    }

    // Separadores de carriles animados
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
    const stripeGeo = new THREE.BoxGeometry(0.24, 0.06, 2.8);
    for (let i = 0; i < 15; i++) {
      const z = -68 + i * 6;
      const divL = new THREE.Mesh(stripeGeo, stripeMat);
      divL.position.set(-1.55, 0.06, z);
      const divR = new THREE.Mesh(stripeGeo, stripeMat);
      divR.position.set(1.55, 0.06, z);
      this.root.add(divL, divR);
      this.stripes.push(divL, divR);
    }

    // Arcos decorativos de circuito Mario Kart que avanzan
    for (let i = 0; i < 3; i++) {
      const arch = this.buildStadiumArch(i % 2 === 0 ? 0xef4444 : 0x3b82f6);
      arch.position.set(0, 0, -18 - i * 24);
      this.root.add(arch);
      this.stadiumArches.push(arch);
    }

    // Indicador luminoso de carril activo
    this.laneHighlight = new THREE.Mesh(
      new THREE.PlaneGeometry(2.7, 32),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.24,
      })
    );
    this.laneHighlight.rotation.x = -Math.PI / 2;
    this.laneHighlight.position.set(0, 0.07, -7);
    this.root.add(this.laneHighlight);

    // Planos clicables para los 3 carriles
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    ([0, 1, 2] as LaneIndex[]).forEach((laneIdx) => {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 65), hitMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(LANE_X[laneIdx], 0.16, -15);
      plane.userData.laneIndex = laneIdx;
      this.root.add(plane);
      this.laneHitPlanes.push(plane);
    });

    // Árboles, tuberías y colinas Nintendo a ambos lados de la pista
    for (let i = 0; i < 10; i++) {
      const z = -64 + i * 8;
      const propL = i % 3 === 0 ? createWarpPipe(2.0, false) : createCuteTree(0x22c55e, 1.25);
      propL.position.set(-8.6 - (i % 2) * 1.4, 0, z);
      const propR = i % 3 === 1 ? createWarpPipe(2.0, false) : createCuteTree(0x16a34a, 1.25);
      propR.position.set(8.6 + ((i + 1) % 2) * 1.4, 0, z);
      this.root.add(propL, propR);
      this.roadsideProps.push(propL, propR);
    }

    // Colinas lejanas, castillo en el horizonte y nubes
    const hillL = createMarioHill(0x22c55e, 5.2, 9.5);
    hillL.position.set(-19, -1, -46);
    const hillR = createMarioHill(0x4ade80, 4.6, 8.2);
    hillR.position.set(19, -1, -48);
    const castle = createMarioCastle(1.1);
    castle.position.set(0, 0, -56);
    const c1 = createCloudModel(1.7);
    c1.position.set(-12, 8.2, -32);
    const c2 = createCloudModel(1.5);
    c2.position.set(13, 9.0, -40);
    this.root.add(hillL, hillR, castle, c1, c2);

    this.buildPortalGroup();
    this.root.add(this.portalGroup);

    this.finishArch = this.buildFinishArch();
    this.finishArch.visible = false;
    this.root.add(this.finishArch);

    // Kart bien visible sobre la parte baja-media de la pantalla
    this.kart = createKartModel();
    this.kart.root.position.set(0, 0.06, 3.2);
    this.root.add(this.kart.root);
  }

  private buildStadiumArch(colorHex: number): THREE.Group {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 });
    const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 6.2, 12), mat);
    lPost.position.set(-6.3, 3.1, 0);
    const rPost = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 6.2, 12), mat);
    rPost.position.set(6.3, 3.1, 0);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.65, 0.55), mat);
    beam.position.set(0, 6.1, 0);
    g.add(lPost, rPost, beam);
    return g;
  }

  private buildPortalGroup(): void {
    const frameColors = [0x38bdf8, 0xa855f7, 0xf59e0b];
    LANE_X.forEach((x, idx) => {
      const arch = new THREE.Group();
      arch.position.set(x, 0, 0);

      const archMat = new THREE.MeshStandardMaterial({
        color: frameColors[idx],
        emissive: frameColors[idx],
        emissiveIntensity: 0.25,
        roughness: 0.3,
      });

      const pillarGeo = new THREE.CylinderGeometry(0.2, 0.24, 3.3, 12);
      const lPillar = new THREE.Mesh(pillarGeo, archMat);
      lPillar.position.set(-1.32, 1.65, 0);
      lPillar.castShadow = true;
      const rPillar = new THREE.Mesh(pillarGeo, archMat);
      rPillar.position.set(1.32, 1.65, 0);
      rPillar.castShadow = true;
      arch.add(lPillar, rPillar);

      const topBar = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.36, 0.45), archMat);
      topBar.position.set(0, 3.3, 0);
      arch.add(topBar);

      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(2.55, 1.6),
        new THREE.MeshBasicMaterial({ transparent: true })
      );
      sign.position.set(0, 2.38, 0.25);
      arch.add(sign);
      this.portalSignMeshes.push(sign);

      const field = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 2.85),
        new THREE.MeshBasicMaterial({
          color: frameColors[idx],
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
        })
      );
      field.position.set(0, 1.42, 0);
      arch.add(field);

      this.portalGroup.add(arch);
    });
  }

  private buildFinishArch(): THREE.Group {
    const g = new THREE.Group();
    const checker = createCheckerTexture('#0f172a', '#ffffff', 6);
    checker.repeat.set(3, 1);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25 });
    const lPole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 4.8, 12), poleMat);
    lPole.position.set(-4.8, 2.4, 0);
    const rPole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 4.8, 12), poleMat);
    rPole.position.set(4.8, 2.4, 0);

    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(10.2, 1.5, 0.35),
      new THREE.MeshStandardMaterial({ map: checker })
    );
    banner.position.set(0, 4.4, 0);
    g.add(lPole, rPole, banner);
    return g;
  }

  public syncState(state: RaceVisualState): void {
    this.currentLane = state.lane;
    this.portalDistance = state.portalDistance;
    this.isFinished = state.event === 'finish';

    if (
      state.portalOptions[0] !== this.currentPortalOptions[0] ||
      state.portalOptions[1] !== this.currentPortalOptions[1] ||
      state.portalOptions[2] !== this.currentPortalOptions[2]
    ) {
      this.currentPortalOptions = [...state.portalOptions] as [number, number, number];
      const borderHex = ['#0284c7', '#7e22ce', '#d97706'];
      this.portalSignMeshes.forEach((mesh, idx) => {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (mat.map) mat.map.dispose();
        mat.map = createNumberSignTexture(
          String(state.portalOptions[idx]),
          '#ffffff',
          borderHex[idx],
          '#0f172a'
        );
        mat.needsUpdate = true;
      });
    }

    if (state.eventTick !== this.lastEventTick) {
      this.lastEventTick = state.eventTick;
      if (state.event === 'turbo') {
        this.turboFlashTimer = 1.1;
        this.particles.burst(
          new THREE.Vector3(this.kartX, 1.2, 2.6),
          [0x38bdf8, 0xfacc15, 0x4ade80, 0xffffff],
          24,
          6.5
        );
      } else if (state.event === 'crash') {
        this.crashTimer = 0.55;
        this.particles.burst(
          new THREE.Vector3(this.kartX, 1.0, 2.4),
          [0xef4444, 0xf97316, 0x94a3b8],
          18,
          5.2
        );
      } else if (state.event === 'finish') {
        this.particles.burst(
          new THREE.Vector3(this.kartX, 2.0, 2.0),
          [0xfacc15, 0x4ade80, 0x38bdf8, 0xf43f5e],
          36,
          7.2
        );
      }
    }
  }

  public handlePointerClick(raycaster: THREE.Raycaster): void {
    if (!this.onSelectLane) return;
    const hits = raycaster.intersectObjects(this.laneHitPlanes, false);
    if (hits.length > 0) {
      const laneIdx = hits[0].object.userData.laneIndex as LaneIndex | undefined;
      if (laneIdx !== undefined) {
        this.onSelectLane(laneIdx);
      }
    }
  }

  public update(dt: number, elapsed: number, camera: THREE.PerspectiveCamera): void {
    this.particles.update(dt);

    const targetX = LANE_X[this.currentLane];
    const dx = targetX - this.kartX;
    this.kartX += dx * Math.min(1, dt * 15);

    this.kart.root.position.x = this.kartX;
    this.laneHighlight.position.x += (targetX - this.laneHighlight.position.x) * Math.min(1, dt * 14);

    this.kart.chassis.rotation.z = THREE.MathUtils.clamp(-dx * 0.14, -0.32, 0.32);
    this.kart.chassis.rotation.y = THREE.MathUtils.clamp(-dx * 0.1, -0.25, 0.25);

    if (this.crashTimer > 0) {
      this.crashTimer = Math.max(0, this.crashTimer - dt);
      this.kart.chassis.position.y = Math.sin(this.crashTimer * 35) * 0.14;
    } else {
      this.kart.chassis.position.y = Math.sin(elapsed * 18) * 0.025;
    }

    const speedFactor = this.turboFlashTimer > 0 ? 2.2 : this.crashTimer > 0 ? 0.35 : 1.0;
    if (this.turboFlashTimer > 0) {
      this.turboFlashTimer = Math.max(0, this.turboFlashTimer - dt);
    }

    const targetFov = this.turboFlashTimer > 0 ? 64 : 52;
    if (Math.abs(camera.fov - targetFov) > 0.1) {
      camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 8);
      camera.updateProjectionMatrix();
    }

    const flamePulse = (this.turboFlashTimer > 0 ? 2.2 : 0.85) + Math.sin(elapsed * 32) * 0.2;
    this.kart.flames.forEach((f) => {
      f.scale.set(1, 1, flamePulse);
    });
    this.kart.wheels.forEach((w) => {
      w.rotation.x -= dt * 16 * speedFactor;
    });

    const scrollSpeed = 24 * speedFactor;
    this.roadTex.offset.y -= dt * scrollSpeed * 0.14;

    this.stripes.forEach((s) => {
      s.position.z += dt * scrollSpeed;
      if (s.position.z > 14) s.position.z -= 90;
    });
    this.roadsideProps.forEach((p) => {
      p.position.z += dt * scrollSpeed;
      if (p.position.z > 14) p.position.z -= 80;
    });
    this.stadiumArches.forEach((a) => {
      a.position.z += dt * scrollSpeed;
      if (a.position.z > 14) a.position.z -= 72;
    });

    if (this.isFinished) {
      this.portalGroup.visible = false;
      this.finishArch.visible = true;
      this.finishArch.position.z = 1.0;
    } else {
      this.portalGroup.visible = true;
      this.finishArch.visible = false;
      this.portalGroup.position.z = THREE.MathUtils.lerp(2.2, -46, this.portalDistance);
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
