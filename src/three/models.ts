import * as THREE from 'three';
import type { AllyId } from '../types/game';

export interface HeroRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cape: THREE.Mesh;
  crown: THREE.Group;
  auraRing: THREE.Mesh;
  suitMat: THREE.MeshPhysicalMaterial;
  accentMat: THREE.MeshPhysicalMaterial;
  setEvolutionTier: (tier: number) => void;
  setEvolved: (evolved: boolean) => void;
}

/**
 * Superhéroe 3D estilo Super Mario Bros. Wonder (acabado glossy clearcoat PBR,
 * proporciones pulidas, guantes, gorra con visera, capa y corona real).
 */
export function createHeroModel(evolved = false): HeroRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const suitMat = new THREE.MeshPhysicalMaterial({
    color: evolved ? 0xf59e0b : 0x2563eb,
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.65,
    clearcoatRoughness: 0.2,
  });
  const accentMat = new THREE.MeshPhysicalMaterial({
    color: evolved ? 0x7c3aed : 0xef4444,
    roughness: 0.24,
    clearcoat: 0.72,
    clearcoatRoughness: 0.18,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd3b6, roughness: 0.45 });
  const gloveMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.22,
    clearcoat: 0.4,
  });
  const bootMat = new THREE.MeshPhysicalMaterial({
    color: 0x78350f,
    roughness: 0.35,
    clearcoat: 0.45,
  });
  const soleMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    roughness: 0.22,
    metalness: 0.35,
    clearcoat: 0.6,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25 });
  const irisMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    roughness: 0.15,
    clearcoat: 0.9,
  });

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 22), suitMat);
  torso.scale.set(1.0, 1.15, 0.92);
  torso.position.y = 0.98;
  torso.castShadow = true;
  bodyGroup.add(torso);

  const shirt = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.41, 0.32, 20), accentMat);
  shirt.position.y = 1.28;
  shirt.castShadow = true;
  bodyGroup.add(shirt);

  const btnGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 16);
  btnGeo.rotateX(Math.PI / 2);
  const btnL = new THREE.Mesh(btnGeo, soleMat);
  btnL.position.set(-0.17, 1.12, 0.41);
  const btnR = new THREE.Mesh(btnGeo, soleMat);
  btnR.position.set(0.17, 1.12, 0.41);
  bodyGroup.add(btnL, btnR);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.425, 0.435, 0.11, 22), darkMat);
  belt.position.y = 0.74;
  bodyGroup.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.09), soleMat);
  buckle.position.set(0, 0.74, 0.42);
  bodyGroup.add(buckle);

  const makeLeg = (x: number): THREE.Group => {
    const legGroup = new THREE.Group();
    legGroup.position.set(x, 0.58, 0);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 0.22, 8, 16), suitMat);
    thigh.position.y = -0.18;
    thigh.castShadow = true;
    legGroup.add(thigh);

    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), bootMat);
    boot.scale.set(1, 0.82, 1.38);
    boot.position.set(0, -0.42, 0.06);
    boot.castShadow = true;
    legGroup.add(boot);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.07, 0.48), soleMat);
    sole.position.set(0, -0.53, 0.06);
    legGroup.add(sole);

    return legGroup;
  };
  const leftLeg = makeLeg(-0.2);
  const rightLeg = makeLeg(0.2);
  bodyGroup.add(leftLeg, rightLeg);

  const makeArm = (x: number, rotZ: number): THREE.Group => {
    const armGroup = new THREE.Group();
    armGroup.position.set(x, 1.24, 0);
    armGroup.rotation.z = rotZ;

    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.28, 8, 16), accentMat);
    sleeve.position.y = -0.18;
    sleeve.castShadow = true;
    armGroup.add(sleeve);

    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.036, 10, 18), gloveMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.35;
    armGroup.add(cuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.155, 16, 16), gloveMat);
    hand.position.y = -0.45;
    hand.castShadow = true;
    armGroup.add(hand);

    return armGroup;
  };
  const leftArm = makeArm(-0.55, 0.38);
  const rightArm = makeArm(0.55, -0.38);
  bodyGroup.add(leftArm, rightArm);

  const head = new THREE.Group();
  head.position.set(0, 1.88, 0);
  bodyGroup.add(head);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.49, 28, 22), skinMat);
  headSphere.castShadow = true;
  head.add(headSphere);

  const earGeo = new THREE.SphereGeometry(0.12, 14, 14);
  const lEar = new THREE.Mesh(earGeo, skinMat);
  lEar.position.set(-0.48, -0.02, 0);
  const rEar = new THREE.Mesh(earGeo, skinMat);
  rEar.position.set(0.48, -0.02, 0);
  head.add(lEar, rEar);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16), skinMat);
  nose.scale.set(1.12, 0.9, 1.0);
  nose.position.set(0, -0.07, 0.48);
  head.add(nose);

  const blushMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.6 });
  const lBlush = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), blushMat);
  lBlush.scale.set(1.2, 0.7, 0.4);
  lBlush.position.set(-0.28, -0.13, 0.4);
  const rBlush = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), blushMat);
  rBlush.scale.set(1.2, 0.7, 0.4);
  rBlush.position.set(0.28, -0.13, 0.4);
  head.add(lBlush, rBlush);

  const makeEye = (x: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0.04, 0.41);
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 16), gloveMat);
    white.scale.set(0.85, 1.25, 0.5);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), irisMat);
    iris.scale.set(0.88, 1.15, 0.5);
    iris.position.set(0, 0, 0.032);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), darkMat);
    pupil.scale.set(0.9, 1.1, 0.5);
    pupil.position.set(0, 0, 0.052);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), gloveMat);
    shine.position.set(0.024, 0.038, 0.072);
    g.add(white, iris, pupil, shine);
    return g;
  };
  head.add(makeEye(-0.16), makeEye(0.16));

  const capDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.525, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.54),
    accentMat
  );
  capDome.rotation.x = -0.14;
  capDome.position.y = 0.04;
  capDome.castShadow = true;
  head.add(capDome);

  const capBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.43, 0.45, 0.075, 22, 1, false, -Math.PI * 0.4, Math.PI * 0.8),
    accentMat
  );
  capBrim.position.set(0, 0.16, 0.25);
  capBrim.rotation.x = 0.22;
  head.add(capBrim);

  const capBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.05, 18), gloveMat);
  capBadge.rotation.x = Math.PI / 2 - 0.15;
  capBadge.position.set(0, 0.34, 0.43);
  const capStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.078, 0), soleMat);
  capStar.position.set(0, 0.34, 0.465);
  head.add(capBadge, capStar);

  const capeGeo = new THREE.BoxGeometry(0.86, 1.08, 0.08);
  capeGeo.translate(0, -0.5, 0);
  const cape = new THREE.Mesh(capeGeo, accentMat);
  cape.position.set(0, 1.38, -0.36);
  cape.rotation.x = 0.25;
  cape.castShadow = true;
  bodyGroup.add(cape);

  const crown = new THREE.Group();
  crown.position.set(0, 0.56, 0);
  const crownMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    metalness: 0.55,
    roughness: 0.18,
    clearcoat: 0.8,
  });
  const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.18, 16), crownMat);
  crown.add(crownBase);

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 8), crownMat);
    spike.position.set(Math.cos(angle) * 0.21, 0.16, Math.sin(angle) * 0.21);
    crown.add(spike);
  }
  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.085, 0),
    new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 0.55,
      clearcoat: 1.0,
    })
  );
  gem.position.set(0, 0.04, 0.26);
  crown.add(gem);
  crown.visible = evolved;
  head.add(crown);

  const auraRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.76, 0.06, 12, 32),
    new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xfacc15,
      emissiveIntensity: 0.75,
    })
  );
  auraRing.rotation.x = Math.PI / 2;
  auraRing.position.y = 0.08;
  auraRing.visible = evolved;
  root.add(auraRing);

  const setEvolutionTier = (tier: number) => {
    if (tier <= 0) {
      suitMat.color.setHex(0x2563eb);
      suitMat.emissive.setHex(0x000000);
      suitMat.emissiveIntensity = 0;
      accentMat.color.setHex(0xef4444);
      cape.visible = false;
      crown.visible = false;
      auraRing.visible = false;
    } else if (tier === 1) {
      suitMat.color.setHex(0xef4444);
      suitMat.emissive.setHex(0x7f1d1d);
      suitMat.emissiveIntensity = 0.15;
      accentMat.color.setHex(0xfacc15);
      cape.visible = false;
      crown.visible = false;
      auraRing.visible = false;
    } else if (tier === 2) {
      suitMat.color.setHex(0x7c3aed);
      suitMat.emissive.setHex(0x4c1d95);
      suitMat.emissiveIntensity = 0.18;
      accentMat.color.setHex(0xf59e0b);
      cape.visible = true;
      cape.scale.set(1.1, 1.05, 1);
      crown.visible = false;
      auraRing.visible = false;
    } else if (tier === 3) {
      suitMat.color.setHex(0xf59e0b);
      suitMat.emissive.setHex(0x92400e);
      suitMat.emissiveIntensity = 0.25;
      accentMat.color.setHex(0x7c3aed);
      cape.visible = true;
      cape.scale.set(1.2, 1.15, 1);
      crown.visible = false;
      auraRing.visible = true;
    } else {
      suitMat.color.setHex(0xf59e0b);
      suitMat.emissive.setHex(0x78350f);
      suitMat.emissiveIntensity = 0.28;
      accentMat.color.setHex(0x7c3aed);
      cape.visible = true;
      cape.scale.set(1.3, 1.22, 1);
      crown.visible = true;
      auraRing.visible = true;
    }
  };

  const setEvolved = (isEvolved: boolean) => setEvolutionTier(isEvolved ? 4 : 0);
  setEvolved(evolved);

  return {
    root,
    bodyGroup,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    cape,
    crown,
    auraRing,
    suitMat,
    accentMat,
    setEvolutionTier,
    setEvolved,
  };
}

/**
 * Aliados 3D seleccionables en la Batalla de Superhéroes (Dino Verde, Princesa Estela, Capitán Champi).
 */
export function createAllyModel(allyId: AllyId): THREE.Group {
  const g = new THREE.Group();
  const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, clearcoat: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    metalness: 0.45,
    roughness: 0.2,
    clearcoat: 0.7,
  });

  if (allyId === 'dino') {
    const greenMat = new THREE.MeshPhysicalMaterial({
      color: 0x22c55e,
      roughness: 0.25,
      clearcoat: 0.65,
    });
    const orangeMat = new THREE.MeshPhysicalMaterial({ color: 0xf97316, roughness: 0.3, clearcoat: 0.5 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 22, 18), greenMat);
    body.scale.set(0.95, 1.15, 1.05);
    body.position.y = 0.8;
    body.castShadow = true;

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 16), whiteMat);
    belly.position.set(0, 0.78, 0.22);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 18), greenMat);
    head.position.set(0, 1.48, 0.08);
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 16), greenMat);
    snout.position.set(0, 1.44, 0.34);

    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const lEye = new THREE.Mesh(eyeGeo, whiteMat);
    lEye.position.set(-0.13, 1.68, 0.22);
    const rEye = new THREE.Mesh(eyeGeo, whiteMat);
    rEye.position.set(0.13, 1.68, 0.22);
    const pGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const lP = new THREE.Mesh(pGeo, darkMat);
    lP.position.set(-0.13, 1.68, 0.29);
    const rP = new THREE.Mesh(pGeo, darkMat);
    rP.position.set(0.13, 1.68, 0.29);

    const saddle = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 14), orangeMat);
    saddle.position.set(0, 0.95, -0.32);

    const bootL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), orangeMat);
    bootL.position.set(-0.2, 0.16, 0.06);
    const bootR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), orangeMat);
    bootR.position.set(0.2, 0.16, 0.06);

    g.add(body, belly, head, snout, lEye, rEye, lP, rP, saddle, bootL, bootR);
  } else if (allyId === 'princess') {
    const pinkMat = new THREE.MeshPhysicalMaterial({
      color: 0xf472b6,
      roughness: 0.24,
      clearcoat: 0.7,
    });
    const hairMat = new THREE.MeshPhysicalMaterial({ color: 0xfde047, roughness: 0.35, clearcoat: 0.4 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd3b6, roughness: 0.45 });

    const gown = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.15, 22), pinkMat);
    gown.position.y = 0.6;
    gown.castShadow = true;
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.4, 16), pinkMat);
    torso.position.y = 1.25;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 18), skinMat);
    head.position.y = 1.7;
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.6),
      hairMat
    );
    hair.position.set(0, 1.75, -0.05);
    hair.rotation.x = -0.25;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.16, 8), goldMat);
    crown.position.y = 2.08;
    const jewel = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.13, 0),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 })
    );
    jewel.position.set(0, 1.22, 0.26);

    const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), goldMat);
    wand.position.set(0.45, 1.3, 0.25);
    wand.rotation.z = -0.3;
    const wandStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), goldMat);
    wandStar.position.set(0.58, 1.72, 0.25);

    g.add(gown, torso, head, hair, crown, jewel, wand, wandStar);
  } else {
    // Capitán Champi (Toad caballero con escudo dorado)
    const capMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.22, clearcoat: 0.65 });
    const spotMat = new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.25, clearcoat: 0.6 });
    const vestMat = new THREE.MeshPhysicalMaterial({ color: 0x2563eb, roughness: 0.3, clearcoat: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd3b6, roughness: 0.45 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.65, 16), vestMat);
    body.position.y = 0.52;
    body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 18, 16), skinMat);
    head.position.y = 1.06;

    const mushroomCap = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 18), capMat);
    mushroomCap.scale.set(1.12, 0.78, 1.12);
    mushroomCap.position.y = 1.44;
    mushroomCap.castShadow = true;
    [
      [0, 0.22, 0.44],
      [-0.4, 0.06, 0.22],
      [0.4, 0.06, 0.22],
    ].forEach(([sx, sy, sz]) => {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), spotMat);
      sp.position.set(sx, 1.44 + sy, sz);
      g.add(sp);
    });

    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 20), goldMat);
    shield.rotation.x = Math.PI / 2;
    shield.position.set(0.42, 0.72, 0.36);

    g.add(body, head, mushroomCap, shield);
  }

  return g;
}

export interface VillainRig {
  root: THREE.Group;
  body: THREE.Group;
  coreMesh: THREE.Mesh;
  hoverRing: THREE.Mesh;
  bodyMat: THREE.MeshPhysicalMaterial;
}

/**
 * Villano Jefe Gigante y Poderoso ("Titán Caos-X") estilo jefe final de Nintendo.
 */
export function createBossVillainModel(): VillainRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = 1.95;
  root.add(body);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x581c87,
    roughness: 0.24,
    metalness: 0.28,
    clearcoat: 0.7,
    clearcoatRoughness: 0.15,
  });
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x15803d,
    roughness: 0.28,
    clearcoat: 0.6,
  });
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    roughness: 0.2,
    metalness: 0.5,
    clearcoat: 0.75,
  });
  const fireMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.85,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xeab308,
    emissiveIntensity: 0.9,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

  // Torso colosal acorazado
  const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(1.38, 1), bodyMat);
  torso.castShadow = true;
  body.add(torso);

  // Núcleo energético ardiente en el pecho
  const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), fireMat);
  coreMesh.position.set(0, -0.05, 1.18);
  body.add(coreMesh);

  // Caparazón trasero con púas doradas estilo Bowser gigante
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.25, 20, 16), shellMat);
  shell.position.set(0, 0.15, -0.65);
  body.add(shell);

  [
    [-0.5, 0.7, -1.5],
    [0.5, 0.7, -1.5],
    [0, 1.0, -1.45],
    [-0.7, -0.1, -1.55],
    [0.7, -0.1, -1.55],
  ].forEach(([sx, sy, sz]) => {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.7, 10), goldMat);
    spike.position.set(sx, sy, sz);
    spike.rotation.x = -Math.PI * 0.42;
    body.add(spike);
  });

  // Hombreras acorazadas y garras pesadas
  [-1.32, 1.32].forEach((sx) => {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 14), darkMat);
    pauldron.position.set(sx, 0.45, 0.1);
    const armSpike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 8), goldMat);
    armSpike.position.set(sx * 1.22, 0.75, 0.1);
    armSpike.rotation.z = sx < 0 ? 0.6 : -0.6;
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 14), bodyMat);
    fist.position.set(sx * 1.08, -0.45, 0.65);
    body.add(pauldron, armSpike, fist);
  });

  // Cuernos gigantes y corona oscura
  const hornGeo = new THREE.ConeGeometry(0.28, 0.95, 12);
  const leftHorn = new THREE.Mesh(hornGeo, goldMat);
  leftHorn.position.set(-0.75, 1.25, 0.15);
  leftHorn.rotation.z = 0.42;
  const rightHorn = new THREE.Mesh(hornGeo, goldMat);
  rightHorn.position.set(0.75, 1.25, 0.15);
  rightHorn.rotation.z = -0.42;
  body.add(leftHorn, rightHorn);

  // Ojos feroces luminosos
  const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), eyeMat);
  lEye.position.set(-0.38, 0.42, 1.15);
  const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), eyeMat);
  rEye.position.set(0.38, 0.42, 1.15);
  const lPupil = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), darkMat);
  lPupil.position.set(-0.36, 0.42, 1.32);
  const rPupil = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), darkMat);
  rPupil.position.set(0.36, 0.42, 1.32);
  body.add(lEye, rEye, lPupil, rPupil);

  const browGeo = new THREE.BoxGeometry(0.48, 0.12, 0.12);
  const lBrow = new THREE.Mesh(browGeo, darkMat);
  lBrow.position.set(-0.38, 0.68, 1.22);
  lBrow.rotation.z = -0.35;
  const rBrow = new THREE.Mesh(browGeo, darkMat);
  rBrow.position.set(0.38, 0.68, 1.22);
  rBrow.rotation.z = 0.35;
  body.add(lBrow, rBrow);

  // Aro de trono flotante gigante
  const hoverRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.13, 14, 36),
    new THREE.MeshStandardMaterial({
      color: 0xc026d3,
      emissive: 0xa21caf,
      emissiveIntensity: 0.7,
    })
  );
  hoverRing.rotation.x = Math.PI / 2;
  hoverRing.position.y = 0.28;
  root.add(hoverRing);

  return { root, body, coreMesh, hoverRing, bodyMat };
}

export interface KartRig {
  root: THREE.Group;
  chassis: THREE.Group;
  wheels: THREE.Mesh[];
  flames: THREE.Mesh[];
}

export function createKartModel(): KartRig {
  const root = new THREE.Group();
  const chassis = new THREE.Group();
  root.add(chassis);

  const redMat = new THREE.MeshPhysicalMaterial({
    color: 0xef4444,
    roughness: 0.18,
    metalness: 0.15,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
  });
  const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, clearcoat: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55 });
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    roughness: 0.2,
    metalness: 0.45,
    clearcoat: 0.75,
  });
  const blueMat = new THREE.MeshPhysicalMaterial({ color: 0x2563eb, roughness: 0.25, clearcoat: 0.6 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfde047,
    emissiveIntensity: 0.9,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.46, 2.3), redMat);
  body.position.y = 0.54;
  body.castShadow = true;
  chassis.add(body);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 2.34), whiteMat);
  stripe.position.y = 0.55;
  chassis.add(stripe);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.34, 0.78), whiteMat);
  nose.position.set(0, 0.46, -1.28);
  nose.castShadow = true;
  chassis.add(nose);

  const headlightGeo = new THREE.SphereGeometry(0.13, 12, 12);
  const lLight = new THREE.Mesh(headlightGeo, glowMat);
  lLight.position.set(-0.4, 0.5, -1.66);
  const rLight = new THREE.Mesh(headlightGeo, glowMat);
  rLight.position.set(0.4, 0.5, -1.66);
  chassis.add(lLight, rLight);

  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.13, 0.38), goldMat);
  spoiler.position.set(0, 1.12, 0.98);
  spoiler.castShadow = true;
  chassis.add(spoiler);

  const postGeo = new THREE.BoxGeometry(0.1, 0.42, 0.12);
  const lPost = new THREE.Mesh(postGeo, darkMat);
  lPost.position.set(-0.48, 0.88, 0.98);
  const rPost = new THREE.Mesh(postGeo, darkMat);
  rPost.position.set(0.48, 0.88, 0.98);
  chassis.add(lPost, rPost);

  const driverBody = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.36, 0.52, 16), blueMat);
  driverBody.position.set(0, 0.9, 0.12);
  chassis.add(driverBody);

  const driverHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 20, 18),
    new THREE.MeshStandardMaterial({ color: 0xffd3b6, roughness: 0.45 })
  );
  driverHead.position.set(0, 1.32, 0.12);
  chassis.add(driverHead);

  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
    redMat
  );
  helmet.position.set(0, 1.35, 0.12);
  chassis.add(helmet);

  const wheelGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.32, 20);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPositions: [number, number, number][] = [
    [-0.82, 0.37, -0.8],
    [0.82, 0.37, -0.8],
    [-0.86, 0.39, 0.78],
    [0.86, 0.39, 0.78],
  ];
  const wheels: THREE.Mesh[] = [];
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, darkMat);
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.34, 14), goldMat);
    hub.rotation.z = Math.PI / 2;
    wheel.add(hub);
    chassis.add(wheel);
    wheels.push(wheel);
  });

  const pipeGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.44, 12);
  pipeGeo.rotateX(Math.PI / 2);
  const lPipe = new THREE.Mesh(pipeGeo, darkMat);
  lPipe.position.set(-0.36, 0.62, 1.24);
  const rPipe = new THREE.Mesh(pipeGeo, darkMat);
  rPipe.position.set(0.36, 0.62, 1.24);
  chassis.add(lPipe, rPipe);

  const flameMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.95,
  });
  const flameGeo = new THREE.ConeGeometry(0.17, 0.85, 10);
  flameGeo.rotateX(Math.PI / 2);
  const lFlame = new THREE.Mesh(flameGeo, flameMat);
  lFlame.position.set(-0.36, 0.62, 1.7);
  const rFlame = new THREE.Mesh(flameGeo, flameMat);
  rFlame.position.set(0.36, 0.62, 1.7);
  chassis.add(lFlame, rFlame);

  return { root, chassis, wheels, flames: [lFlame, rFlame] };
}

export interface OwlRig {
  root: THREE.Group;
  head: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
}

export function createOwlModel(): OwlRig {
  const root = new THREE.Group();

  const brownMat = new THREE.MeshPhysicalMaterial({ color: 0x92400e, roughness: 0.45, clearcoat: 0.25 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    roughness: 0.2,
    metalness: 0.5,
    clearcoat: 0.75,
  });
  const orangeMat = new THREE.MeshPhysicalMaterial({ color: 0xf97316, roughness: 0.3, clearcoat: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.85, 26, 22), brownMat);
  torso.scale.set(1, 1.15, 0.92);
  torso.position.y = 1.05;
  torso.castShadow = true;
  root.add(torso);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.66, 20, 18), creamMat);
  belly.position.set(0, 0.92, 0.34);
  belly.scale.set(0.95, 1.05, 0.72);
  root.add(belly);

  const wingGeo = new THREE.SphereGeometry(0.5, 16, 14);
  wingGeo.scale(0.35, 1.1, 0.72);
  const leftWing = new THREE.Mesh(wingGeo, brownMat);
  leftWing.position.set(-0.82, 1.05, 0);
  leftWing.rotation.z = 0.2;
  leftWing.castShadow = true;
  root.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, brownMat);
  rightWing.position.set(0.82, 1.05, 0);
  rightWing.rotation.z = -0.2;
  rightWing.castShadow = true;
  root.add(rightWing);

  const footGeo = new THREE.ConeGeometry(0.18, 0.24, 6);
  const lFoot = new THREE.Mesh(footGeo, orangeMat);
  lFoot.position.set(-0.3, 0.12, 0.25);
  lFoot.rotation.x = Math.PI / 2;
  const rFoot = new THREE.Mesh(footGeo, orangeMat);
  rFoot.position.set(0.3, 0.12, 0.25);
  rFoot.rotation.x = Math.PI / 2;
  root.add(lFoot, rFoot);

  const head = new THREE.Group();
  head.position.set(0, 2.02, 0.06);
  root.add(head);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.68, 26, 22), brownMat);
  headMesh.scale.set(1.06, 0.95, 0.95);
  headMesh.castShadow = true;
  head.add(headMesh);

  const tuftGeo = new THREE.ConeGeometry(0.18, 0.36, 10);
  const lTuft = new THREE.Mesh(tuftGeo, brownMat);
  lTuft.position.set(-0.48, 0.56, 0);
  lTuft.rotation.z = 0.45;
  const rTuft = new THREE.Mesh(tuftGeo, brownMat);
  rTuft.position.set(0.48, 0.56, 0);
  rTuft.rotation.z = -0.45;
  head.add(lTuft, rTuft);

  const faceDiscGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.08, 22);
  faceDiscGeo.rotateX(Math.PI / 2);
  const lDisc = new THREE.Mesh(faceDiscGeo, creamMat);
  lDisc.position.set(-0.24, 0.08, 0.56);
  const rDisc = new THREE.Mesh(faceDiscGeo, creamMat);
  rDisc.position.set(0.24, 0.08, 0.56);
  head.add(lDisc, rDisc);

  const eyeWhiteGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const lWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
  lWhite.position.set(-0.24, 0.08, 0.6);
  const rWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
  rWhite.position.set(0.24, 0.08, 0.6);
  head.add(lWhite, rWhite);

  const pupilGeo = new THREE.SphereGeometry(0.095, 14, 14);
  const leftEye = new THREE.Mesh(pupilGeo, darkMat);
  leftEye.position.set(-0.23, 0.08, 0.71);
  const rightEye = new THREE.Mesh(pupilGeo, darkMat);
  rightEye.position.set(0.23, 0.08, 0.71);
  head.add(leftEye, rightEye);

  const rimGeo = new THREE.TorusGeometry(0.24, 0.03, 12, 26);
  const lRim = new THREE.Mesh(rimGeo, goldMat);
  lRim.position.set(-0.24, 0.08, 0.66);
  const rRim = new THREE.Mesh(rimGeo, goldMat);
  rRim.position.set(0.24, 0.08, 0.66);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), goldMat);
  bridge.position.set(0, 0.1, 0.66);
  head.add(lRim, rRim, bridge);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), orangeMat);
  beak.rotation.x = Math.PI * 0.75;
  beak.position.set(0, -0.05, 0.68);
  head.add(beak);

  const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.16, 18), darkMat);
  capBase.position.set(0, 0.64, 0);
  const capTop = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.06, 0.86), darkMat);
  capTop.position.set(0, 0.74, 0);
  capTop.rotation.y = Math.PI / 6;
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.34, 8), goldMat);
  tassel.position.set(0.38, 0.58, 0.25);
  tassel.rotation.z = -0.25;
  head.add(capBase, capTop, tassel);

  return { root, head, leftWing, rightWing, leftEye, rightEye };
}

/**
 * Flor Maravilla luminosa estilo Super Mario Bros. Wonder.
 */
export function createWonderFlower(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const petalMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
    roughness: 0.15,
    clearcoat: 0.9,
  });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe0f2fe, emissiveIntensity: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
  const leafMat = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, roughness: 0.3, clearcoat: 0.5 });

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), petalMat);
    petal.scale.set(1.1, 1.1, 0.55);
    petal.position.set(Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0);
    g.add(petal);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), coreMat);
  core.scale.set(1, 1, 0.6);
  const eyeL = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.07, 4, 8), darkMat);
  eyeL.position.set(-0.08, 0.03, 0.16);
  const eyeR = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.07, 4, 8), darkMat);
  eyeR.position.set(0.08, 0.03, 0.16);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.55, 8), leafMat);
  stem.position.y = -0.45;
  g.add(core, eyeL, eyeR, stem);
  g.scale.setScalar(scale);
  return g;
}

/**
 * Arcoíris 3D en el fondo estilo New Super Mario Bros. U Deluxe.
 */
export function createRainbowArch(radius = 12): THREE.Group {
  const g = new THREE.Group();
  const colors = [0xef4444, 0xf97316, 0xfacc15, 0x4ade80, 0x38bdf8, 0xa855f7];
  colors.forEach((hex, idx) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(radius - idx * 0.42, 0.22, 10, 48, Math.PI),
      new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.65 })
    );
    g.add(arc);
  });
  return g;
}

/**
 * Árbol frondoso estilo Super Mario Wonder con frutos/flores brillantes.
 */
export function createWonderTree(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.42, 1.8, 14),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
  );
  trunk.position.y = 0.9;
  trunk.castShadow = true;
  g.add(trunk);

  const leafMat = new THREE.MeshPhysicalMaterial({ color: 0x16a34a, roughness: 0.45, clearcoat: 0.25 });
  const leafLightMat = new THREE.MeshPhysicalMaterial({ color: 0x4ade80, roughness: 0.4, clearcoat: 0.3 });
  const flowerMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.3,
    clearcoat: 0.7,
  });

  [
    [0, 2.25, 0, 1.15, leafMat],
    [-0.65, 2.0, 0.2, 0.78, leafLightMat],
    [0.68, 2.05, -0.15, 0.82, leafLightMat],
    [0, 2.85, 0.1, 0.85, leafLightMat],
  ].forEach(([x, y, z, r, m]) => {
    const c = new THREE.Mesh(new THREE.SphereGeometry(r as number, 18, 16), m as THREE.Material);
    c.position.set(x as number, y as number, z as number);
    c.castShadow = true;
    g.add(c);
  });

  [
    [-0.5, 2.4, 0.85],
    [0.45, 2.55, 0.8],
    [0.1, 2.1, 1.05],
  ].forEach(([fx, fy, fz]) => {
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), flowerMat);
    fl.position.set(fx, fy, fz);
    g.add(fl);
  });

  g.scale.setScalar(scale);
  return g;
}

export function createWarpPipe(height = 1.8, withPiranha = false): THREE.Group {
  const g = new THREE.Group();
  const pipeMat = new THREE.MeshPhysicalMaterial({
    color: 0x16a34a,
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
  });
  const innerMat = new THREE.MeshStandardMaterial({ color: 0x052e16, roughness: 0.9 });

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, height, 24), pipeMat);
  shaft.position.y = height / 2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  g.add(shaft);

  const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.44, 24), pipeMat);
  lip.position.y = height - 0.12;
  lip.castShadow = true;
  g.add(lip);

  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 20), innerMat);
  hole.position.y = height + 0.08;
  g.add(hole);

  if (withPiranha) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 0.75, 10),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 })
    );
    stem.position.y = height + 0.35;
    g.add(stem);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 18, 18),
      new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.25, clearcoat: 0.65 })
    );
    head.position.y = height + 0.85;
    head.castShadow = true;
    g.add(head);

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    [
      [-0.18, 0.14, 0.25],
      [0.2, 0.08, 0.24],
      [0, 0.25, -0.18],
    ].forEach(([sx, sy, sz]) => {
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), whiteMat);
      spot.position.set(sx, height + 0.85 + sy, sz);
      g.add(spot);
    });

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.32), whiteMat);
    jaw.position.set(0, height + 0.82, 0.26);
    g.add(jaw);
  }

  return g;
}

export function createMarioCastle(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshPhysicalMaterial({ color: 0xfef3c7, roughness: 0.5, clearcoat: 0.2 });
  const roofMat = new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.25, clearcoat: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
  const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.45 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.8, 3.2), wallMat);
  base.position.y = 1.4;
  base.castShadow = true;
  g.add(base);

  const door = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.3, 18), darkMat);
  door.rotation.x = Math.PI / 2;
  door.position.set(0, 0.9, 1.56);
  g.add(door);

  const keep = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 3.2, 18), wallMat);
  keep.position.set(0, 3.4, 0);
  keep.castShadow = true;
  const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 2.1, 18), roofMat);
  mainRoof.position.set(0, 5.7, 0);
  const spire = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), goldMat);
  spire.position.set(0, 6.8, 0);
  g.add(keep, mainRoof, spire);

  [-1.9, 1.9].forEach((tx) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 3.4, 16), wallMat);
    tower.position.set(tx, 1.7, 1.1);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.84, 1.3, 16), roofMat);
    roof.position.set(tx, 4.0, 1.1);
    g.add(tower, roof);
  });

  g.scale.setScalar(scale);
  return g;
}

export function createSkyAirship(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
  const trimMat = new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.35 });
  const sailMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.75 });
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.1, 1.5), woodMat);
  hull.castShadow = true;
  const deckTrim = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.22, 1.66), trimMat);
  deckTrim.position.y = 0.55;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 1.2), woodMat);
  cabin.position.set(1.0, 0.95, 0);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 10), woodMat);
  mast.position.set(-0.3, 1.7, 0);
  const sail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 1.6), sailMat);
  sail.position.set(-0.2, 1.85, 0);
  const flag = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 4), flagMat);
  flag.rotation.z = -Math.PI / 2;
  flag.position.set(-0.7, 2.85, 0);
  g.add(hull, deckTrim, cabin, mast, sail, flag);
  g.scale.setScalar(scale);
  return g;
}

export function createMarioHill(color = 0x22c55e, width = 2.6, height = 4.2): THREE.Group {
  const g = new THREE.Group();
  const hillMat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, clearcoat: 0.25 });
  const spotMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(width * 0.5, height, 10, 20), hillMat);
  body.position.y = height * 0.45;
  g.add(body);

  const spot1 = new THREE.Mesh(new THREE.SphereGeometry(width * 0.18, 12, 12), spotMat);
  spot1.position.set(-width * 0.22, height * 0.68, width * 0.38);
  const spot2 = new THREE.Mesh(new THREE.SphereGeometry(width * 0.14, 12, 12), spotMat);
  spot2.position.set(width * 0.2, height * 0.48, width * 0.4);
  g.add(spot1, spot2);
  return g;
}

export function createWingedBuddy(color = 0x16a34a): THREE.Group {
  const g = new THREE.Group();
  const shellMat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, clearcoat: 0.6 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });

  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), shellMat);
  shell.scale.set(1, 0.85, 1.15);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), bellyMat);
  head.position.set(-0.36, 0.15, 0);
  const lWing = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.08), wingMat);
  lWing.position.set(0.05, 0.38, -0.35);
  lWing.rotation.x = 0.4;
  const rWing = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.08), wingMat);
  rWing.position.set(0.05, 0.38, 0.35);
  rWing.rotation.x = -0.4;
  g.add(shell, head, lWing, rWing);
  return g;
}

export function createCloudModel(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  const parts: [number, number, number, number][] = [
    [0, 0, 0, 0.85],
    [-0.7, -0.15, 0.1, 0.62],
    [0.72, -0.12, -0.05, 0.65],
    [0.2, 0.3, 0.1, 0.55],
  ];
  parts.forEach(([x, y, z, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), mat);
    m.position.set(x, y, z);
    g.add(m);
  });
  g.scale.setScalar(scale);
  return g;
}

export function createCuteTree(foliageColor = 0x22c55e, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.3, 1.1, 12),
    new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 })
  );
  trunk.position.y = 0.55;
  trunk.castShadow = true;
  g.add(trunk);

  const leafMat = new THREE.MeshPhysicalMaterial({ color: foliageColor, roughness: 0.45, clearcoat: 0.25 });
  const crown1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 18, 16), leafMat);
  crown1.position.y = 1.45;
  crown1.castShadow = true;
  const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 14), leafMat);
  crown2.position.set(0.32, 1.85, 0.15);
  crown2.castShadow = true;
  g.add(crown1, crown2);
  g.scale.setScalar(scale);
  return g;
}

export function createCoinMesh(): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.35,
    metalness: 0.55,
    roughness: 0.16,
    clearcoat: 0.85,
  });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 22), mat);
  coin.rotation.x = Math.PI / 2;
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.38, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.4 })
  );
  g.add(coin, slot);
  return g;
}
