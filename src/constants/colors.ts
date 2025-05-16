import { ColorScheme } from '../types/map';

/**
 * Collection of color schemes
 */
export const colorSchemes: Record<string, ColorScheme> = {

// Binary --------------------------------------------------
  
  // Binary scheme (0 = transparent, 1 = color)
  binaryRed: {
    name: 'binaryRed',
    displayName: 'Binary',
    description: 'Transparent (0) to red (1) for binary/boolean operations',
    buckets: 1,
    colors: [
      '#d73027'   // Darkest red
    ],
    type: 'sequential'
  },
  
  // Binary scheme (0 = transparent, 1 = color)
  binaryGreen: {
    name: 'binaryGreen',
    displayName: 'Binary',
    description: 'Transparent (0) to green (1) for binary/boolean operations',
    buckets: 1,
    colors: [
      '#66bd63'   // green
    ],
    type: 'sequential'
  },

  // Binary scheme (0 = transparent, 1 = color)
  binaryPurple: {
    name: 'binaryPurple',
    displayName: 'Binary',
    description: 'Transparent (0) to green (1) for binary/boolean operations',
    buckets: 1,
    colors: [
      '#6a51a3'   // purple
    ],
    type: 'sequential'
  },

// Brewer Divergent --------------------------------------------------
  
  brewerGreenToRed3: {
    name: 'brewerGreenToRed3',
    displayName: 'Brewer Green to Red 3',
    description: 'Green (low) to Red (high)',
    type: 'divergent',
    buckets: 3,
    colors: ['#91cf60','#ffffbf','#fc8d59'],
  },

  brewerGreenToRed4: {
    name: 'brewerGreenToRed4',
    displayName: 'Brewer Green to Red 4',
    description: 'Green (low) to Red (high)',
    type: 'divergent',
    buckets: 4,
    colors: ['#1a9641','#a6d96a','#fdae61','#d7191c'],
  },

  brewerGreenToRed5: {
    name: 'brewerGreenToRed5',
    displayName: 'Brewer Green to Red 5',
    description: 'Green (low) to Red (high)',
    type: 'divergent',
    buckets: 5,
    colors: ['#1a9641','#a6d96a','#ffffbf','#fdae61','#d7191c'],
  },

  brewerGreenToRed6: {
    name: 'brewerGreenToRed6',
    displayName: 'Brewer Green to Red 6',
    description: 'Green (low) to Red (high)',
    type: 'divergent',
    buckets: 6,
    colors: ['#1a9850','#91cf60','#d9ef8b','#ffffbf','#fee08b','#fc8d59','#d73027'],
  },

  brewerGreenToRed7: {
    name: 'brewerGreenToRed7',
    displayName: 'Brewer Green to Red 7',
    description: 'Green (low) to Red (high)',
    type: 'divergent',
    buckets: 7,
    colors: ['#1a9850','#91cf60','#d9ef8b','#ffffbf','#fee08b','#fc8d59','#d73027'],
  },

// Brewer Sequential  --------------------------------------------------

  brewerYellowToRed4: {
    name: 'brewerYellowToRed4',
    displayName: 'Brewer Yellow to Red 4',
    description: 'Yellow (low) to Red (high)',
    type: 'sequential',
    buckets: 4,
    colors: ['#ffffb2','#fecc5c','#fd8d3c','#e31a1c'],
  },

  brewerYellowToRed5: {
    name: 'brewerYellowToRed5',
    displayName: 'Brewer Yellow to Red 5',
    description: 'Yellow (low) to Red (high)',
    type: 'sequential',
    buckets: 5,
    colors: ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'],
  },

  brewerWhiteToBlue3: {
    name: 'brewerWhiteToBlue3',
    displayName: 'Brewer White to Blue 3',
    description: 'White (low) to Blue (high)',
    type: 'sequential',
    buckets: 3,
    colors: ['#deebf7','#9ecae1','#3182bd'],
  },

  brewerWhiteToBlue4: {
    name: 'brewerWhiteToBlue4',
    displayName: 'Brewer White to Blue 4',
    description: 'White (low) to Blue (high)',
    type: 'sequential',
    buckets: 4,
    colors: ['#eff3ff','#bdd7e7','#6baed6','#2171b5'],
  },

  brewerWhiteToBlue9: {
    name: 'brewerWhiteToBlue9',
    displayName: 'Brewer White to Blue 9',
    description: 'White (low) to Blue (high)',
    type: 'sequential',
    buckets: 9,
    colors: ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'],
  },

// Brewer Quantitative --------------------------------------------------
  
  brewerQuant5: {
    name: 'brewerQuant5',
    displayName: 'Brewer Quantative 5',
    description: '',
    type: 'quantitative',
    buckets: 5,
    colors: ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3'],
  },

// Others --------------------------------------------------

  arcGISBlue4: {
    name: 'arcGISBlue4',
    displayName: 'ArcGIS to Blue 4',
    description: 'White (low) to Blue (high)',
    type: 'sequential',
    buckets: 4,
    colors: ['#BEE8FF','#00C5FF','#00A9E6','#00A9E6'],
  },

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
    type: 'sequential'
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
    type: 'sequential'
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
    type: 'sequential'
  },
  
  slopeGradient: {
    name: 'slopeGradient',
    displayName: 'Slope Gradient',
    description: 'Green (flat) to red (steep) gradient for slope visualization',
    buckets: 10,
    colors: [
      "#D0D0D0", // Flat (0-5°)
      "#F1E9C6",
      "#F5D73F",
      "#F8C129",
      "#F79E19", // Moderate (20-25°)
      "#F77516",
      "#F44911",
      "#E91C0A",
      "#E30F05", // Steep (40-45°)
      "#9E0000"
    ],
    type: 'sequential'
  }
};

// GeoTIFF specific colors
export const GeoTiffNoDataColor = { 
  r: 0,    // Red: 0
  g: 0,    // Green: 0 
  b: 0,    // Blue: 0
  a: 0     // Alpha: 0 (completely transparent)
}; // Transparent - will show background

export const defaultColorScheme = colorSchemes.greenYellowRed;
export const defaultColorSchemeBinary = colorSchemes.binaryPurple;