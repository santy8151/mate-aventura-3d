import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  life: number;
  maxLife: number;
  gravity: number;
}

/**
 * Sistema ligero de partículas 3D tipo juguete/estrella para explosiones, saltos y confeti.
 */
export class ParticleBurstSystem {
  public readonly group = new THREE.Group();
  private particles: Particle[] = [];
  private readonly boxGeo = new THREE.OctahedronGeometry(0.18, 0);

  public burst(
    origin: THREE.Vector3,
    colors: number[],
    count = 16,
    speed = 5,
    gravity = 9.5,
    scale = 1
  ): void {
    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(this.boxGeo, mat);
      mesh.position.copy(origin);
      mesh.scale.setScalar(scale * (0.6 + Math.random() * 0.7));

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.7;
      const spd = speed * (0.45 + Math.random() * 0.75);

      const vel = new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * spd,
        Math.cos(phi) * spd + 1.5,
        Math.sin(theta) * Math.sin(phi) * spd
      );

      const rotVel = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      this.group.add(mesh);
      this.particles.push({
        mesh,
        vel,
        rotVel,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.45,
        gravity,
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }

      p.vel.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.rotVel.x * dt;
      p.mesh.rotation.y += p.rotVel.y * dt;
      p.mesh.rotation.z += p.rotVel.z * dt;

      const t = p.life / p.maxLife;
      const fadeScale = Math.max(0.01, 1 - t * t);
      p.mesh.scale.setScalar(fadeScale);
    }
  }

  public dispose(): void {
    for (const p of this.particles) {
      this.group.remove(p.mesh);
      (p.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
    this.boxGeo.dispose();
  }
}
