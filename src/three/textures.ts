import * as THREE from 'three';

/**
 * Crea un domo de cielo 3D con degradado suave estilo Nintendo.
 */
export function createSkyDome(topHex: number, bottomHex: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(95, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(topHex) },
      bottomColor: { value: new THREE.Color(bottomHex) },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        float t = clamp(h * 0.85 + 0.25, 0.0, 1.0);
        gl_FragColor = vec4(mix(bottomColor, topColor, pow(t, 0.75)), 1.0);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

/**
 * Crea texturas nítidas con Canvas 2D para señales 3D de portales.
 */
export function createNumberSignTexture(
  label: string,
  bgColor = '#ffffff',
  borderColor = '#f59e0b',
  textColor = '#1e293b'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const r = 44;
  ctx.fillStyle = borderColor;
  roundRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, r);
  ctx.fill();

  ctx.fillStyle = bgColor;
  roundRect(ctx, 24, 24, canvas.width - 48, canvas.height - 48, r - 12);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  roundRect(ctx, 40, 34, canvas.width - 80, 48, 22);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.font = '900 176px "Fredoka", "Nunito", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeText(label, canvas.width / 2, canvas.height / 2 + 8);
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createMysteryBlockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#fde047');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, 238, 238);

  ctx.strokeStyle = '#fef9c3';
  ctx.lineWidth = 6;
  ctx.strokeRect(22, 22, 212, 212);

  ctx.fillStyle = '#78350f';
  const corners = [
    [36, 36],
    [220, 36],
    [36, 220],
    [220, 220],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.font = '900 165px "Fredoka", "Nunito", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#92400e';
  ctx.fillText('?', 136, 142);
  ctx.fillStyle = '#fffbeb';
  ctx.fillText('?', 126, 132);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createMarioBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c2410c';
  ctx.fillRect(0, 0, 256, 256);

  const rows = 4;
  const cols = 2;
  const rowH = 256 / rows;
  const colW = 256 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : colW / 2;
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const y = r * rowH;
      // Ladrillo principal
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(x + 4, y + 4, colW - 8, rowH - 8);
      // Luz superior
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(x + 4, y + 4, colW - 8, 8);
      // Sombra inferior
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(x + 4, y + rowH - 10, colW - 8, 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createMarioSoilTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 256, 256);

  // Patrón cálido estilo tierra New Super Mario Bros
  const colors = ['#d97706', '#92400e', '#f59e0b'];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const cx = x * 32 + 16 + ((y % 2) * 8 - 4);
      const cy = y * 32 + 16;
      ctx.fillStyle = colors[(x + y) % colors.length];
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createArenaStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 512, 512);

  const size = 64;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#f8fafc' : '#cbd5e1';
      ctx.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * size + 2, y * size + 2, size - 4, size - 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createRoadAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  // Grano sutil de asfalto
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
  }

  // Bandas laterales tipo circuito Mario Kart
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(10, 0, 14, 512);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(488, 0, 14, 512);

  // Flechas de avance en los 3 carriles
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  [92, 256, 420].forEach((cx) => {
    ctx.beginPath();
    ctx.moveTo(cx, 120);
    ctx.lineTo(cx - 28, 175);
    ctx.lineTo(cx - 10, 175);
    ctx.lineTo(cx - 10, 220);
    ctx.lineTo(cx + 10, 220);
    ctx.lineTo(cx + 10, 175);
    ctx.lineTo(cx + 28, 175);
    ctx.closePath();
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createCheckerTexture(
  colorA = '#ffffff',
  colorB = '#e2e8f0',
  cells = 8
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const size = canvas.width / cells;

  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(x * size, y * size, size, size);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
