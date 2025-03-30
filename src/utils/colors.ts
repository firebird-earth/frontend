import { ColorScheme } from '../types/map';
import { colorSchemes, GeoTiffNoDataColor } from '../constants/colors';

/**
 * Convert a hex color to RGB components
 * @param hex The hex color string (e.g., "#ff0000")
 * @returns An object with r, g, b components (0-255)
 */
export function hexToRgb(hex: string | undefined): { r: number, g: number, b: number } {
  // Handle undefined or invalid input
  if (!hex) {
    console.warn('Invalid hex color value:', hex);
    return { r: 0, g: 0, b: 0 };
  }

  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    console.warn('Invalid hex color format:', hex);
    return { r: 0, g: 0, b: 0 };
  }
  
  try {
    // Parse the hex values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Validate parsed values
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('Failed to parse hex color components');
    }
    
    return { r, g, b };
  } catch (error) {
    console.warn('Error parsing hex color:', error);
    return { r: 0, g: 0, b: 0 };
  }
}

/**
 * Get a color scheme by name
 * @param name The name of the color scheme
 * @returns The color scheme or undefined if not found
 */
export function getColorScheme(name: string): ColorScheme | undefined {
  return colorSchemes[name];
}

/**
 * Get a color from a scheme based on a normalized value (0-1)
 * @param scheme The color scheme to use
 * @param normalizedValue A value between 0 and 1
 * @returns The color as a hex string
 */
export function getColorFromScheme(scheme: ColorScheme, normalizedValue: number): string {
  // Ensure value is between 0 and 1
  const value = Math.max(0, Math.min(1, normalizedValue));
  
  // Calculate the index in the color array
  const index = Math.min(
    Math.floor(value * scheme.colors.length),
    scheme.colors.length - 1
  );
  
  return scheme.colors[index];
}

/**
 * Get a color from a scheme based on a raw value and domain range
 * @param scheme The color scheme to use
 * @param value The raw value
 * @param range Optional domain range [min, max]. Defaults to [0, 100]
 * @returns The color as a hex string
 */
export function getColorForValue(scheme: ColorScheme, value: number, range?: [number, number]): string {
  const [min, max] = range || [0, 100];
  const normalizedValue = (value - min) / (max - min);
  return getColorFromScheme(scheme, normalizedValue);
}

/**
 * Get a CSS gradient string for a color scheme
 * @param scheme The color scheme
 * @returns A CSS gradient string (e.g., "linear-gradient(to right, #ff0000, #00ff00)")
 */
export function getGradientForScheme(scheme: ColorScheme): string {
  return `linear-gradient(to right, ${scheme.colors.join(', ')})`;
}

/**
 * Get Tailwind CSS classes for a gradient based on a color scheme
 * @param scheme The color scheme
 * @returns Tailwind CSS classes for a gradient
 */
export function getTailwindGradientClasses(scheme: ColorScheme): string {
  if (scheme.colors.length < 2) {
    return '';
  }
  
  if (scheme.colors.length === 2) {
    return `from-[${scheme.colors[0]}] to-[${scheme.colors[1]}]`;
  }
  
  // For 3 or more colors, use from-via-to
  const middleIndex = Math.floor(scheme.colors.length / 2);
  return `from-[${scheme.colors[0]}] via-[${scheme.colors[middleIndex]}] to-[${scheme.colors[scheme.colors.length - 1]}]`;
}

export { GeoTiffNoDataColor };