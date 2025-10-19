import * as THREE from 'three';

/**
 * Creates a text texture from a string with customizable styling
 * @param text - The text to render
 * @param fontSize - Font size in pixels
 * @param color - Text color (default: '#1a1a2e')
 * @returns THREE.CanvasTexture or null if canvas context fails
 */
export function createTextTexture(
  text: string, 
  fontSize: number, 
  color: string = '#1a1a2e'
): THREE.CanvasTexture | null {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;
  
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return new THREE.CanvasTexture(canvas);
}
