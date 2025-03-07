/**
 * Color scheme definitions for visualization
 * Each scheme has a name, number of buckets, and colors for each bucket
 */

export interface ColorScheme {
  name: string;
  displayName: string;
  description: string;
  buckets: number;
  colors: string[];
  type: 'sequential' | 'diverging' | 'qualitative';
  domain?: [number, number]; // Optional min/max domain values
}

/**
 * Collection of color schemes
 */
export const colorSchemes: Record<string, ColorScheme> = {
  // Sequential schemes (low to high)
  redYellowGreen: {
    name: 'redYellowGreen',
    displayName: 'Red-Yellow-Green',
    description: 'Red (high) to yellow to green (low)',
    buckets: 9,
    colors: [
      '#1a9850', // Darkest green (lowest value)
      '#66bd63',
      '#a6d96a',
      '#d9ef8b',
      '#ffffbf', // Yellow (middle value)
      '#fee08b',
      '#fdae61',
      '#f46d43',
      '#d73027'  // Darkest red (highest value)
    ],
    type: 'sequential'
  },
  
  greenYellowRed: {
    name: 'greenYellowRed',
    displayName: 'Green-Yellow-Red',
    description: 'Green (low) to yellow to red (high)',
    buckets: 9,
    colors: [
      '#1a9850',  // Darkest green (lowest value)
      '#66bd63',
      '#a6d96a',
      '#d9ef8b',
      '#ffffbf', // Yellow (middle value)
      '#fee08b',
      '#fdae61',
      '#f46d43',
      '#d73027' // Darkest red (highest value)
    ],
    type: 'sequential'
  },
  
  blueToRed: {
    name: 'blueToRed',
    displayName: 'Blue to Red',
    description: 'Blue (low) to red (high)',
    buckets: 7,
    colors: [
      '#2166ac', // Darkest blue (lowest value)
      '#4393c3',
      '#92c5de',
      '#f7f7f7', // White (middle value)
      '#fddbc7',
      '#d6604d',
      '#b2182b'  // Darkest red (highest value)
    ],
    type: 'sequential'
  },
  
  // Diverging schemes (centered around a middle value)
  redBlue: {
    name: 'redBlue',
    displayName: 'Red-Blue',
    description: 'Red (negative) to white to blue (positive)',
    buckets: 11,
    colors: [
      '#67001f', // Darkest red (most negative)
      '#b2182b',
      '#d6604d',
      '#f4a582',
      '#fddbc7',
      '#f7f7f7', // White (neutral)
      '#d1e5f0',
      '#92c5de',
      '#4393c3',
      '#2166ac',
      '#053061'  // Darkest blue (most positive)
    ],
    type: 'diverging'
  },
  
  brownTeal: {
    name: 'brownTeal',
    displayName: 'Brown-Teal',
    description: 'Brown (negative) to white to teal (positive)',
    buckets: 11,
    colors: [
      '#543005', // Darkest brown (most negative)
      '#8c510a',
      '#bf812d',
      '#dfc27d',
      '#f6e8c3',
      '#f5f5f5', // White (neutral)
      '#c7eae5',
      '#80cdc1',
      '#35978f',
      '#01665e',
      '#003c30'  // Darkest teal (most positive)
    ],
    type: 'diverging'
  },
  
  // Qualitative schemes (for categorical data)
  category10: {
    name: 'category10',
    displayName: 'Category 10',
    description: 'Distinct colors for categorical data',
    buckets: 10,
    colors: [
      '#1f77b4', // Blue
      '#ff7f0e', // Orange
      '#2ca02c', // Green
      '#d62728', // Red
      '#9467bd', // Purple
      '#8c564b', // Brown
      '#e377c2', // Pink
      '#7f7f7f', // Gray
      '#bcbd22', // Olive
      '#17becf'  // Cyan
    ],
    type: 'qualitative'
  },
  
  // Fire-specific schemes
  fireIntensity: {
    name: 'fireIntensity',
    displayName: 'Fire Intensity',
    description: 'Yellow to orange to red for fire intensity',
    buckets: 7,
    colors: [
      '#ffeda0', // Light yellow (lowest intensity)
      '#fed976',
      '#feb24c',
      '#fd8d3c',
      '#fc4e2a',
      '#e31a1c',
      '#b10026'  // Dark red (highest intensity)
    ],
    type: 'sequential',
    domain: [0, 100]
  },
  
  burnProbability: {
    name: 'burnProbability',
    displayName: 'Burn Probability',
    description: 'Yellow to red for burn probability',
    buckets: 5,
    colors: [
      '#ffeda0', // Light yellow (lowest probability)
      '#feb24c',
      '#fd8d3c',
      '#f03b20',
      '#bd0026'  // Dark red (highest probability)
    ],
    type: 'sequential',
    domain: [0, 1]
  },
  
  canopyCover: {
    name: 'canopyCover',
    displayName: 'Canopy Cover',
    description: 'Light to dark green for canopy cover',
    buckets: 5,
    colors: [
      '#edf8e9', // Light green (lowest cover)
      '#bae4b3',
      '#74c476',
      '#31a354',
      '#006d2c'  // Dark green (highest cover)
    ],
    type: 'sequential',
    domain: [0, 100]
  }
};

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
 * Get a color from a scheme based on a raw value and the scheme's domain
 * @param scheme The color scheme to use
 * @param value The raw value
 * @returns The color as a hex string
 */
export function getColorForValue(scheme: ColorScheme, value: number): string {
  if (!scheme.domain) {
    throw new Error(`Color scheme ${scheme.name} does not have a domain defined`);
  }
  
  const [min, max] = scheme.domain;
  const normalizedValue = (value - min) / (max - min);
  
  return getColorFromScheme(scheme, normalizedValue);
}

/**
 * Convert a hex color to RGB components
 * @param hex The hex color string (e.g., "#ff0000")
 * @returns An object with r, g, b components (0-255)
 */
export function hexToRgb(hex: string): { r: number, g: number, b: number } {
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Parse the hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
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