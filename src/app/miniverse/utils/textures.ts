import * as THREE from 'three';

// Procedural wall texture generator (albedo, bump, roughness)
export function generateWallTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512; // Keep lightweight but detailed
  const albedo = document.createElement('canvas');
  const height = document.createElement('canvas');
  const rough = document.createElement('canvas');
  albedo.width = albedo.height = size;
  height.width = height.height = size;
  rough.width = rough.height = size;

  const actx = albedo.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const rctx = rough.getContext('2d')!;

  // Fill base color
  actx.fillStyle = baseColor;
  actx.fillRect(0, 0, size, size);

  // Subtle plaster noise using multi-frequency sine noise
  const imageData = actx.getImageData(0, 0, size, size);
  const hData = hctx.createImageData(size, size);
  const rData = rctx.createImageData(size, size);
  const data = imageData.data;
  const hd = hData.data;
  const rd = rData.data;

  // Convert baseColor to RGB
  const tmp = new THREE.Color(baseColor);
  const baseR = Math.round(tmp.r * 255);
  const baseG = Math.round(tmp.g * 255);
  const baseB = Math.round(tmp.b * 255);

  const seed = 37.913;
  const f1 = 0.035, f2 = 0.09, f3 = 0.16;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n1 = Math.sin((x + seed) * f1) * Math.sin((y - seed) * f1);
      const n2 = Math.sin((x * 1.7 + y * 0.5 + seed) * f2);
      const n3 = Math.sin((x * 0.6 - y * 1.3 - seed) * f3);
      let n = (n1 * 0.6 + n2 * 0.3 + n3 * 0.1);
      n = (n + 1) / 2; // 0..1
      const speckle = (Math.random() * 0.04); // micro-variation per pixel
      const brightness = 0.92 + n * 0.06 + speckle; // subtle range

      data[i] = Math.min(255, Math.max(0, Math.round(baseR * brightness)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(baseG * brightness)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(baseB * brightness)));
      data[i + 3] = 255;

      // Height for bump: stronger response on mid-tones
      const hVal = Math.round(140 + n * 80);
      hd[i] = hd[i + 1] = hd[i + 2] = hVal;
      hd[i + 3] = 255;

      // Roughness map: brighter = rougher
      const rVal = Math.round(180 + (1 - n) * 60);
      rd[i] = rd[i + 1] = rd[i + 2] = rVal;
      rd[i + 3] = 255;
    }
  }

  // Vertical panel seams
  const seams = 5; // number of panels across
  actx.putImageData(imageData, 0, 0);
  hctx.putImageData(hData, 0, 0);
  rctx.putImageData(rData, 0, 0);
  actx.strokeStyle = 'rgba(0,0,0,0.05)';
  actx.lineWidth = 1;
  hctx.strokeStyle = 'rgba(0,0,0,0.35)';
  hctx.lineWidth = 1;
  for (let s = 1; s < seams; s++) {
    const x = Math.floor((s / seams) * size);
    actx.beginPath();
    actx.moveTo(x, 0);
    actx.lineTo(x, size);
    actx.stroke();
    hctx.beginPath();
    hctx.moveTo(x, 0);
    hctx.lineTo(x, size);
    hctx.stroke();
  }

  const map = new THREE.CanvasTexture(albedo);
  const bumpMap = new THREE.CanvasTexture(height);
  const roughnessMap = new THREE.CanvasTexture(rough);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  bumpMap.needsUpdate = true;
  roughnessMap.needsUpdate = true;

  return { map, bumpMap, roughnessMap };
}

// Subtle plaster textures for ceiling (no seams, softer variation)
export function generateCeilingTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const albedo = document.createElement('canvas');
  const height = document.createElement('canvas');
  const rough = document.createElement('canvas');
  albedo.width = albedo.height = size;
  height.width = height.height = size;
  rough.width = rough.height = size;

  const actx = albedo.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const rctx = rough.getContext('2d')!;

  actx.fillStyle = baseColor;
  actx.fillRect(0, 0, size, size);

  const imageData = actx.getImageData(0, 0, size, size);
  const hData = hctx.createImageData(size, size);
  const rData = rctx.createImageData(size, size);
  const data = imageData.data;
  const hd = hData.data;
  const rd = rData.data;

  const tmp = new THREE.Color(baseColor);
  const baseR = Math.round(tmp.r * 255);
  const baseG = Math.round(tmp.g * 255);
  const baseB = Math.round(tmp.b * 255);

  const seed = 11.71;
  const f1 = 0.025, f2 = 0.065, f3 = 0.12;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n1 = Math.sin((x + seed) * f1) * Math.sin((y - seed) * f1);
      const n2 = Math.sin((x * 1.2 + y * 0.7 + seed) * f2);
      const n3 = Math.sin((x * 0.5 - y * 1.1 - seed) * f3);
      let n = (n1 * 0.55 + n2 * 0.35 + n3 * 0.1);
      n = (n + 1) / 2;
      const speckle = 0.015 * Math.sin(i * 0.0007);
      const brightness = 0.96 + n * 0.03 + speckle;

      data[i] = Math.min(255, Math.max(0, Math.round(baseR * brightness)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(baseG * brightness)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(baseB * brightness)));
      data[i + 3] = 255;

      const hVal = Math.round(150 + n * 40);
      hd[i] = hd[i + 1] = hd[i + 2] = hVal;
      hd[i + 3] = 255;

      const rVal = Math.round(170 + (1 - n) * 40);
      rd[i] = rd[i + 1] = rd[i + 2] = rVal;
      rd[i + 3] = 255;
    }
  }

  actx.putImageData(imageData, 0, 0);
  hctx.putImageData(hData, 0, 0);
  rctx.putImageData(rData, 0, 0);

  const map = new THREE.CanvasTexture(albedo);
  const bumpMap = new THREE.CanvasTexture(height);
  const roughnessMap = new THREE.CanvasTexture(rough);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  bumpMap.needsUpdate = true;
  roughnessMap.needsUpdate = true;

  return { map, bumpMap, roughnessMap };
}

// Procedural wood texture generator (linear grain with subtle variation)
export function generateWoodTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const sizeX = 1024;
  const sizeY = 512;
  const albedo = document.createElement('canvas');
  const height = document.createElement('canvas');
  const rough = document.createElement('canvas');
  albedo.width = sizeX; albedo.height = sizeY;
  height.width = sizeX; height.height = sizeY;
  rough.width = sizeX; rough.height = sizeY;

  const actx = albedo.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const rctx = rough.getContext('2d')!;

  const aData = actx.createImageData(sizeX, sizeY);
  const hData = hctx.createImageData(sizeX, sizeY);
  const rData = rctx.createImageData(sizeX, sizeY);
  const ad = aData.data;
  const hd = hData.data;
  const rd = rData.data;

  const base = new THREE.Color(baseColor);
  const baseR = Math.round(base.r * 255);
  const baseG = Math.round(base.g * 255);
  const baseB = Math.round(base.b * 255);

  // Grain frequencies
  const fPrimary = 0.015; // long grain
  const fSecondary = 0.12; // fine grain
  const fWobble = 0.005; // warp in grain
  const seed = 73.291;

  for (let y = 0; y < sizeY; y++) {
    for (let x = 0; x < sizeX; x++) {
      const i = (y * sizeX + x) * 4;

      // Horizontal grain with slight vertical wobble
      const wobble = Math.sin((y + seed) * fWobble) * 24;
      const gx = x + wobble;
      const longGrain = Math.sin(gx * fPrimary) * 0.6 + 0.4;
      const fineGrain = Math.sin((gx + y * 0.35 + seed) * fSecondary) * 0.25 + 0.75;
      const ring = Math.pow(longGrain * fineGrain, 1.2);

      // Occasional darker streaks
      const streak = (Math.sin((x * 0.03 + y * 0.02) + seed) * 0.5 + 0.5) * 0.06;
      const brightness = 0.88 + ring * 0.12 - streak;

      ad[i] = Math.min(255, Math.max(0, Math.round(baseR * brightness)));
      ad[i + 1] = Math.min(255, Math.max(0, Math.round(baseG * brightness * (0.98 + ring * 0.02))));
      ad[i + 2] = Math.min(255, Math.max(0, Math.round(baseB * (0.94 + ring * 0.06))));
      ad[i + 3] = 255;

      // Height map for bump (responds around mid-tones of ring)
      const hVal = Math.round(120 + ring * 100 - streak * 80);
      hd[i] = hd[i + 1] = hd[i + 2] = hVal;
      hd[i + 3] = 255;

      // Roughness: darker grains slightly smoother
      const rVal = Math.round(170 + (1 - ring) * 60 + streak * 30);
      rd[i] = rd[i + 1] = rd[i + 2] = rVal;
      rd[i + 3] = 255;
    }
  }

  actx.putImageData(aData, 0, 0);
  hctx.putImageData(hData, 0, 0);
  rctx.putImageData(rData, 0, 0);

  const map = new THREE.CanvasTexture(albedo);
  const bumpMap = new THREE.CanvasTexture(height);
  const roughnessMap = new THREE.CanvasTexture(rough);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  bumpMap.needsUpdate = true;
  roughnessMap.needsUpdate = true;
  return { map, bumpMap, roughnessMap };
}

// Procedural fabric texture (woven) for upholstered furniture
export function generateFabricTextures(baseColor: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const albedo = document.createElement('canvas');
  const height = document.createElement('canvas');
  const rough = document.createElement('canvas');
  albedo.width = albedo.height = size;
  height.width = height.height = size;
  rough.width = rough.height = size;

  const actx = albedo.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const rctx = rough.getContext('2d')!;

  const base = new THREE.Color(baseColor);
  const baseR = Math.round(base.r * 255);
  const baseG = Math.round(base.g * 255);
  const baseB = Math.round(base.b * 255);

  const imageData = actx.createImageData(size, size);
  const hData = hctx.createImageData(size, size);
  const rData = rctx.createImageData(size, size);
  const ad = imageData.data;
  const hd = hData.data;
  const rd = rData.data;

  // Weave parameters
  const threadSize = 6; // pixels per thread
  const variation = 6;  // subtle brightness variation

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const warp = Math.floor(x / threadSize) % 2 === 0; // vertical thread
      const weft = Math.floor(y / threadSize) % 2 === 0; // horizontal thread
      const weave = (warp ? 1 : 0) ^ (weft ? 1 : 0); // over/under pattern

      // Thread profile: rounded cross-section
      const rx = x % threadSize;
      const ry = y % threadSize;
      const dx = Math.min(rx, threadSize - rx) / (threadSize * 0.5);
      const dy = Math.min(ry, threadSize - ry) / (threadSize * 0.5);
      const radial = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));

      const noise = (Math.sin((x + y * 7) * 0.07) * 0.5 + 0.5) * 0.06;
      const weaveBoost = weave ? 0.08 : -0.04;
      const brightness = 0.86 + radial * 0.10 + weaveBoost + noise;

      ad[i] = Math.min(255, Math.max(0, Math.round(baseR * brightness)));
      ad[i + 1] = Math.min(255, Math.max(0, Math.round(baseG * brightness)));
      ad[i + 2] = Math.min(255, Math.max(0, Math.round(baseB * brightness)));
      ad[i + 3] = 255;

      // Bump: higher on thread centers
      const hVal = Math.round(140 + radial * 90 + (weave ? 10 : 0));
      hd[i] = hd[i + 1] = hd[i + 2] = hVal;
      hd[i + 3] = 255;

      // Roughness: slightly rougher between threads
      const rVal = Math.round(180 + (1 - radial) * 60 + (weave ? -10 : 10));
      rd[i] = rd[i + 1] = rd[i + 2] = rVal;
      rd[i + 3] = 255;
    }
  }

  actx.putImageData(imageData, 0, 0);
  hctx.putImageData(hData, 0, 0);
  rctx.putImageData(rData, 0, 0);

  const map = new THREE.CanvasTexture(albedo);
  const bumpMap = new THREE.CanvasTexture(height);
  const roughnessMap = new THREE.CanvasTexture(rough);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.needsUpdate = true;
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);
  bumpMap.needsUpdate = true;
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);
  roughnessMap.needsUpdate = true;

  return { map, bumpMap, roughnessMap };
}
