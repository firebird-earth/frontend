/**
 * Calculates the perceived brightness of a color from a base64 image.
 * Returns a weighted brightness value that considers both lightness and hue.
 * 
 * @param imageData - Base64 encoded image data
 * @returns Promise resolving to a brightness value between 0 and 1
 */
export const getBrightness = (imageData: string): Promise<number> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(0);

  const img = new Image();
  img.src = `data:image/png;base64,${imageData}`;

  return new Promise<number>((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      let totalHue = 0;
      let totalSaturation = 0;
      let totalLightness = 0;
      let pixelCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const a = data[i + 3];

        if (a === 0) continue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lightness = (max + min) / 2;

        let hue = 0;
        let saturation = 0;

        if (max !== min) {
          const d = max - min;
          saturation = lightness > 0.5 ? d / (2 - max - min) : d / (max + min);

          if (max === r) {
            hue = (g - b) / d + (g < b ? 6 : 0);
          } else if (max === g) {
            hue = (b - r) / d + 2;
          } else if (max === b) {
            hue = (r - g) / d + 4;
          }
          hue /= 6;
        }

        totalHue += hue;
        totalSaturation += saturation;
        totalLightness += lightness;
        pixelCount++;
      }

      if (pixelCount === 0) {
        resolve(0);
        return;
      }

      const avgHue = totalHue / pixelCount;
      const avgSaturation = totalSaturation / pixelCount;
      const avgLightness = totalLightness / pixelCount;

      const hueFactor = Math.abs(avgHue - 0.16667);
      const brightnessFactor = avgLightness * (1 + avgSaturation * hueFactor);

      resolve(brightnessFactor);
    };
  });
};

/**
 * Returns the appropriate Tailwind CSS gradient classes based on the layer type.
 * 
 * @param url - URL of the GeoTIFF file
 * @returns Tailwind CSS gradient classes
 */
export const getGradientColors = (url: string): string => {
  // Green to red gradient (green for lower values, red for higher values)
  return 'from-green-500 via-yellow-400 to-red-500';
};

/**
 * Determines the appropriate color channels for a GeoTIFF visualization based on the layer type.
 * 
 * @param url - URL of the GeoTIFF file
 * @param normalizedValue - Normalized value between 0 and 1
 * @returns Object with red, green, blue channel values (0-255)
 */
export const getColorChannels = (url: string, normalizedValue: number): { r: number, g: number, b: number } => {
  // Green to red gradient (green for lower values, red for higher values)
  const minBrightness = 120; // Minimum brightness to ensure visibility
  
  // For green component (decreases as value increases)
  const greenIntensity = Math.floor(255 * (minBrightness/255 + (1 - normalizedValue) * (1 - minBrightness/255)));
  
  // For red component (increases as value increases)
  const redIntensity = Math.floor(255 * (minBrightness/255 + normalizedValue * (1 - minBrightness/255)));
  
  // Add some blue for mid-range values to create yellow transition
  const blueIntensity = normalizedValue > 0.3 && normalizedValue < 0.7 
    ? Math.floor(100 * Math.sin(Math.PI * (normalizedValue - 0.3) / 0.4))
    : 0;
  
  return {
    r: redIntensity,
    g: greenIntensity,
    b: blueIntensity
  };
};

/**
 * Returns the color to use for nodata values in GeoTIFF visualizations.
 * 
 * @returns Object with red, green, blue, alpha channel values (0-255)
 */
export const getNoDataColor = (): { r: number, g: number, b: number, a: number } => {
  // Use transparent for nodata values
  return {
    r: 0,   // Red channel
    g: 0,   // Green channel
    b: 0,   // Blue channel
    a: 0    // Fully transparent
  };
};

/**
 * Returns the color to use for zero values in GeoTIFF visualizations.
 * 
 * @returns Object with red, green, blue, alpha channel values (0-255)
 */
export const getZeroValueColor = (): { r: number, g: number, b: number, a: number } => {
  // Use blue for zero values
  return {
    r: 0,   // Red channel (none)
    g: 0,   // Green channel (none)
    b: 255, // Blue channel (full)
    a: 255  // Fully opaque
  };
};