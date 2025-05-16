// distanceRaster.ts
// Computes a “distance to nearest feature” raster via:
//  1) rasterizing features into a binary mask using OffscreenCanvas
//  2) computing a true Euclidean distance transform (two‐pass 1D EDT)

import * as turf from '@turf/turf';
import { Feature, Geometry } from '@turf/helpers';

/**
 * @param features      Array of GeoJSON Features (already in projected coords)
 * @param width         Raster width in pixels
 * @param height        Raster height in pixels
 * @param minX          Left‐edge X of the tile (projected)
 * @param maxY          Top‐edge Y of the tile (projected)
 * @param pixelWidth    Pixel size in X (projected units)
 * @param pixelHeight   Pixel size in Y (negative projected units)
 */
export function computeDistanceRaster(
  features: Feature<Geometry>[],
  width: number,
  height: number,
  minX: number,
  maxY: number,
  pixelWidth: number,
  pixelHeight: number
): Float32Array {
  const total = width * height;
  const INF = 1e20;

  // 1) Build binary mask via OffscreenCanvas
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('computeDistanceRaster requires OffscreenCanvas support');
  }
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context on OffscreenCanvas');
  }
  // clear
  ctx.clearRect(0, 0, width, height);
  // draw features in white on black
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;

  const absPixH = Math.abs(pixelHeight);
  // transform function: geo->pixel
  const toPixel = (x: number, y: number) => [
    (x - minX) / pixelWidth,
    (maxY - y) / absPixH
  ];

  for (const feat of features) {
    const geom = feat.geometry;
    ctx.beginPath();

    if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      for (const rings of polys) {
        for (const ring of rings) {
          ring.forEach(([x, y], idx) => {
            const [px, py] = toPixel(x, y);
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
        }
      }
      ctx.fill();

    } else if (geom.type === 'LineString' || geom.type === 'MultiLineString') {
      const lines = geom.type === 'LineString' ? [geom.coordinates] : geom.coordinates;
      for (const line of lines) {
        line.forEach(([x, y], idx) => {
          const [px, py] = toPixel(x, y);
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
      }
      ctx.stroke();

    } else if (geom.type === 'Point' || geom.type === 'MultiPoint') {
      const pts = geom.type === 'Point' ? [geom.coordinates] : geom.coordinates;
      for (const [x, y] of pts) {
        const [px, py] = toPixel(x, y);
        ctx.fillRect(px, py, 1, 1);
      }
    }
    // other geometries (e.g., GeometryCollection) are not supported here
  }

  // extract mask
  const img = ctx.getImageData(0, 0, width, height).data;
  const f = new Float64Array(total);
  for (let i = 0, p = 0; i < total; i++, p += 4) {
    // white pixel => inside => distance 0, else INF
    f[i] = img[p] > 0 ? 0 : INF;
  }

  // 2) two-pass 1D EDT
  // pass along rows
  const dtRow = new Float64Array(total);
  for (let r = 0; r < height; r++) {
    const offset = r * width;
    const row = f.subarray(offset, offset + width);
    const dtr = edt1d(row, width, pixelWidth);
    dtRow.set(dtr, offset);
  }

  // pass along cols + sqrt
  const output = new Float32Array(total);
  for (let c = 0; c < width; c++) {
    // collect column
    const colArr = new Float64Array(height);
    for (let r = 0; r < height; r++) {
      colArr[r] = dtRow[r * width + c];
    }
    const dtc = edt1d(colArr, height, absPixH);
    for (let r = 0; r < height; r++) {
      output[r * width + c] = Math.sqrt(dtc[r]);
    }
  }

  return output;
}

// 1D squared-distance transform (Felzenszwalb & Huttenlocher)
function edt1d(
  f: Float64Array,
  n: number,
  spacing: number
): Float64Array {
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  const sq = spacing * spacing;

  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = +Infinity;

  for (let q = 1; q < n; q++) {
    let s: number;
    do {
      const p = v[k];
      s = ((f[q] + q * q * sq) - (f[p] + p * p * sq)) /
          (2 * (q - p) * sq);
      if (s <= z[k]) k--;
    } while (s <= z[k] && k > 0);
    k++;
    v[k] = q;
    z[k] = s;
    z[k+1] = +Infinity;
  }

  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k+1] < q) k++;
    const diff = q - v[k];
    d[q] = diff * diff * sq + f[v[k]];
  }

  return d;
}
