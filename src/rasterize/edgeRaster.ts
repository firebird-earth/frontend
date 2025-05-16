// edgeRaster.ts

/**
 * Compute a binary edge raster by stroking each feature's boundary into
 * an offscreen canvas and then reading back the pixels.
 *
 * Emits debug logs via `log(...)` inside the worker.
 *
 * @param features      Array of turf.Feature (in WebMercator coords)
 * @param width         Raster width
 * @param height        Raster height
 * @param minX          Left coordinate of origin (projected)
 * @param maxY          Top coordinate of origin (projected)
 * @param pixelWidth    Pixel width in projection units
 * @param pixelHeight   Negative pixel height in projection units
 * @returns             Float32Array binary edge mask (1 = edge, 0 = background)
 */
import * as turf from '@turf/turf';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) { console.log('[EdgeRaster]', ...args); }
}

export function computeEdgeRaster(
  features: turf.Feature[],
  width: number,
  height: number,
  minX: number,
  maxY: number,
  pixelWidth: number,
  pixelHeight: number
): Float32Array {
  const total = width * height;
  const start = performance.now();
  log(`Starting computeEdgeRaster: features=${features.length}, tile=${width}×${height}`);

  // 1) create or fallback to an HTMLCanvasElement
  let canvas: OffscreenCanvas | HTMLCanvasElement;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = (canvas as any).getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;

  // project coords → pixel
  const absH = Math.abs(pixelHeight);
  const toPx = ([x, y]: [number, number]): [number, number] => [
    (x - minX) / pixelWidth,
    (maxY - y) / absH
  ];

  // draw only the polygon boundaries
  for (const feat of features) {
    const geom = feat.geometry;

    if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      const polys = geom.type === 'Polygon'
        ? [geom.coordinates as turf.Position[][]]
        : (geom.coordinates as turf.Position[][][]);

      for (const rings of polys) {
        for (const ring of rings) {
          ctx.beginPath();
          ring.forEach(([x, y], i) => {
            const [px, py] = toPx([x, y]);
            if (i === 0) ctx.moveTo(px, py);
            else        ctx.lineTo(px, py);
          });
          ctx.stroke();
        }
      }
    }
    // If desired, lines/points could also be stroked here
  }

  // 2) read back the alpha channel into a mask
  const img = ctx.getImageData(0, 0, width, height).data;
  const mask = new Uint8Array(total);
  let strokedCount = 0;
  for (let i = 0, p = 3; i < total; i++, p += 4) {
    const isEdge = img[p] > 0 ? 1 : 0;
    mask[i] = isEdge;
    strokedCount += isEdge;
  }
  log(`Stroked pixels (edge hits): ${strokedCount}/${total}`);

  // 3) output directly as Float32Array (1 = edge, 0 = background)
  const out = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    out[i] = mask[i];
  }

  const duration = performance.now() - start;
  log(`computeEdgeRaster completed in ${duration.toFixed(2)}ms`);
  return out;
}
