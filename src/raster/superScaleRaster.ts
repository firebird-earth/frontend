export function superscaleCanvas(
  imageData: ImageData,
  width: number,
  height: number,
  scale = 1,             // how much to scale the image (e.g. 2 = double resolution)
  smoothing = true       // whether to interpolate pixels when scaling
): HTMLCanvasElement {
  // 1. Create a “base” canvas at the original size
  const base = document.createElement('canvas');
  base.width = width;
  base.height = height;

  // 2. Draw the raw ImageData onto it
  const ctx = base.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  // 3. Create a second canvas at the scaled dimensions
  const scaled = document.createElement('canvas');
  scaled.width = width * scale;
  scaled.height = height * scale;

  // 4. Configure smoothing (interpolation) if desired
  const sctx = scaled.getContext('2d')!;
  sctx.imageSmoothingEnabled = smoothing;

  // 5. Draw the base canvas into the scaled canvas, stretching it
  sctx.drawImage(base, 0, 0, scaled.width, scaled.height);

  // 6. Return the off-screen, scaled canvas element
  return scaled;
}
