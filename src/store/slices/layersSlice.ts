import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MapLayer, LayerCategory } from '../../types/map';
import { TILE_LAYERS, WUI_LAYER, CRISIS_AREAS_LAYER, GEOTIFF_LAYERS } from '../../constants/urls';

interface LayersState {
  categories: {
    [key: string]: LayerCategory;
  };
  loading: boolean;
  error: string | null;
  slopeRenderingRule: string;
}

const createInitialCategory = (
  id: string,
  name: string,
  layers: Partial<MapLayer>[]
): LayerCategory => ({
  id,
  name,
  layers: layers.map((layer, index) => ({
    id: index + 1,
    name: '',
    type: 'tile',
    source: '',
    active: false,
    ...layer
  }))
});

const initialState: LayersState = {
  categories: {
    basemaps: createInitialCategory('basemaps', 'Basemaps', [
      { name: 'Street', active: true, source: TILE_LAYERS.STREET },
      { name: 'Street (light)', source: TILE_LAYERS.STREET_LIGHT },
      { name: 'Terrain', source: TILE_LAYERS.TERRAIN },
      { name: 'Satellite', source: TILE_LAYERS.SATELLITE }
    ]),
    wildfire: createInitialCategory('wildfire', 'Wildfire', [
      { name: 'WUI', type: 'tile', source: WUI_LAYER },
      { name: 'Wildfire Crisis Areas', type: 'vector', source: CRISIS_AREAS_LAYER },
      { name: 'Priority Treatment Areas', type: 'vector' }
    ]),
    elevation: createInitialCategory('elevation', 'Elevation', [
      { 
        name: 'Hillshade', 
        type: 'dynamic', 
        source: 'slope',
        renderingRule: 'Hillshade Gray'
      },
      { 
        name: 'Aspect', 
        type: 'dynamic', 
        source: 'slope',
        renderingRule: 'Aspect Degrees'
      },
      { 
        name: 'Slope Steepness', 
        type: 'dynamic', 
        source: 'slope',
        renderingRule: 'Slope Map'
      },
      { 
        name: 'Contour', 
        type: 'dynamic', 
        source: 'slope',
        renderingRule: 'Contour'
      }
    ]),
    firemetrics: createInitialCategory('firemetrics', 'Fire Metrics', [
      { 
        name: 'Flame Length',
        type: 'geotiff',
        source: GEOTIFF_LAYERS.FLAME_LENGTH,
        active: false,
        order: 10
      },
      { 
        name: 'Burn Probability',
        type: 'geotiff',
        source: GEOTIFF_LAYERS.BURN_PROBABILITY,
        active: false,
        order: 20
      }
    ]),
    fuels: createInitialCategory('fuels', 'Fuels', [
      { 
        name: 'Canopy Cover', 
        type: 'geotiff',
        source: GEOTIFF_LAYERS.CANOPY_COVER,
        active: false,
        order: 30
      },
      { 
        name: 'Canopy Height', 
        type: 'geotiff',
        source: GEOTIFF_LAYERS.CANOPY_HEIGHT,
        active: false,
        order: 40
      },
      { 
        name: 'Canopy Bulk Density', 
        type: 'geotiff',
        source: GEOTIFF_LAYERS.CANOPY_BULK_DENSITY,
        active: false,
        order: 50
      },
      { 
        name: 'Mortality', 
        type: 'placeholder',
        source: '',
        active: false,
        order: 60
      }
    ]),
    landscape: createInitialCategory('landscape', 'Landscape', [
      { name: 'Timber Base', type: 'vector' },
      { name: 'Roadless Areas', type: 'vector' },
      { name: 'Wilderness Areas', type: 'vector' },
      { name: 'Cultural Areas', type: 'vector' }
    ]),
    jurisdictions: createInitialCategory('jurisdictions', 'Jurisdictions', [
      { name: 'US Forest Service', type: 'vector' },
      { name: 'Bureau of Land Management', type: 'vector' },
      { name: 'US Fish and Wildlife', type: 'vector' },
      { name: 'National Park Service', type: 'vector' },
      { name: 'Bureau of Reclamation', type: 'vector' },
      { name: 'Bureau of Indian Affairs', type: 'vector' },
      { name: 'State Owned', type: 'vector' },
      { name: 'Private Land', type: 'vector' }
    ]),
    transportation: createInitialCategory('transportation', 'Transportation', [
      { name: 'State DOT Roads', type: 'vector' },
      { name: 'County Roads', type: 'vector' },
      { name: 'National Forest Service Roads', type: 'vector' }
    ]),
    water: createInitialCategory('water', 'Water', [
      { name: 'Watersheds L8', type: 'vector' },
      { name: 'Watersheds L10', type: 'vector' },
      { name: 'Watersheds L12', type: 'vector' },
      { name: 'Waterways Ephemeral', type: 'vector' },
      { name: 'Waterways Intermittent', type: 'vector' },
      { name: 'Waterways Perennial', type: 'vector' },
      { name: 'Lakes, Wetlands and Ponds', type: 'vector' }
    ]),
    infrastructure: createInitialCategory('infrastructure', 'Infrastructure', [
      { name: 'Buildings', type: 'vector' },
      { name: 'Power Transmission Lines', type: 'vector' },
      { name: 'High Voltage Power Transmission Lines', type: 'vector' }
    ]),
    restorationClass: createInitialCategory('restorationClass', 'Restoration Class', [
      { name: 'Moderate Departure Veg. Conditions Class', type: 'vector' },
      { name: 'Significant Departure Veg. Condition Class', type: 'vector' }
    ]),
    habitat: createInitialCategory('habitat', 'Habitat', [
      { name: 'Mule Deer', type: 'vector' },
      { name: 'Gunnison Sage Grouse', type: 'vector' },
      { name: 'Migration Corridors', type: 'vector' },
      { name: 'Lynx Analysis Units (LAU)', type: 'vector' }
    ])
  },
  loading: false,
  error: null,
  slopeRenderingRule: 'Hillshade Gray'
};

const layersSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    toggleLayer: (
      state,
      action: PayloadAction<{ categoryId: string; layerId: number }>
    ) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      if (categoryId === 'basemaps') {
        // Basemaps are always exclusive
        category.layers.forEach(l => {
          l.active = l.id === layerId;
        });
      } else {
        // For all other layers, just toggle the clicked layer
        layer.active = !layer.active;
      }
    },
    toggleSingleLayer: (
      state,
      action: PayloadAction<{ categoryId: string; layerId: number }>
    ) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      if (categoryId === 'basemaps') {
        // Basemaps are exclusive only within basemaps
        category.layers.forEach(l => {
          l.active = l.id === layerId;
        });
      } else if (categoryId === 'firemetrics' || categoryId === 'fuels') {
        // FireMetrics tab layers (including fuels) are independent
        layer.active = !layer.active;
      } else {
        // For layers tab categories (not basemaps):
        // 1. Turn off all layers in the layers tab (except basemaps)
        // 2. Toggle the clicked layer
        Object.entries(state.categories).forEach(([catId, cat]) => {
          // Skip basemaps and FireMetrics tab categories
          if (catId !== 'basemaps' && catId !== 'firemetrics' && catId !== 'fuels') {
            cat.layers.forEach(l => {
              // If this is the clicked layer, toggle it
              if (catId === categoryId && l.id === layerId) {
                l.active = !l.active;
              } else {
                // Turn off all other layers in the layers tab
                l.active = false;
              }
            });
          }
        });

        // Update rendering rule for elevation layers
        if (categoryId === 'elevation' && layer.renderingRule) {
          state.slopeRenderingRule = layer.renderingRule;
        }
      }
    },
    setLayerOpacity: (
      state,
      action: PayloadAction<{
        categoryId: string;
        layerId: number;
        opacity: number;
      }>
    ) => {
      const { categoryId, layerId, opacity } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (layer) {
        layer.opacity = Math.max(0, Math.min(1, opacity));
      }
    },
    bringLayerToFront: (
      state,
      action: PayloadAction<{
        categoryId: string;
        layerId: number;
      }>
    ) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer || layer.type !== 'geotiff') return;

      const highestOrder = Math.max(
        ...Object.values(state.categories)
          .flatMap(cat => cat.layers)
          .filter(l => l.type === 'geotiff' && l.order !== undefined)
          .map(l => l.order!)
      );
      
      layer.order = highestOrder + 10;
    },
    sendLayerToBack: (
      state,
      action: PayloadAction<{
        categoryId: string;
        layerId: number;
      }>
    ) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer || layer.type !== 'geotiff') return;

      const lowestOrder = Math.min(
        ...Object.values(state.categories)
          .flatMap(cat => cat.layers)
          .filter(l => l.type === 'geotiff' && l.order !== undefined)
          .map(l => l.order!)
      );
      
      layer.order = lowestOrder - 10;
    },
    bringLayerForward: (
      state,
      action: PayloadAction<{
        categoryId: string;
        layerId: number;
      }>
    ) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer || layer.type !== 'geotiff' || layer.order === undefined) return;

      const allGeoTiffLayers = Object.values(state.categories)
        .flatMap(cat => cat.layers)
        .filter(l => l.type === 'geotiff' && l.order !== undefined)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const currentIndex = allGeoTiffLayers.findIndex(l => l.id === layer.id);
      if (currentIndex < allGeoTiffLayers.length - 1) {
        const nextLayer = allGeoTiffLayers[currentIndex + 1];
        const tempOrder = layer.order;
        layer.order = nextLayer.order;
        nextLayer.order = tempOrder;
      }
    },
    sendLayerBackward: (
      state,
      action: PayloadAction<{
        categoryId: string;
        layerId: number;
      }>
    ) => {
      const { categoryId, layerId } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer || layer.type !== 'geotiff' || layer.order === undefined) return;

      const allGeoTiffLayers = Object.values(state.categories)
        .flatMap(cat => cat.layers)
        .filter(l => l.type === 'geotiff' && l.order !== undefined)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const currentIndex = allGeoTiffLayers.findIndex(l => l.id === layer.id);
      if (currentIndex > 0) {
        const prevLayer = allGeoTiffLayers[currentIndex - 1];
        const tempOrder = layer.order;
        layer.order = prevLayer.order;
        prevLayer.order = tempOrder;
      }
    },
    setLayerBounds: (
      state,
      action: PayloadAction<{
        categoryId: string;
        layerId: number;
        bounds: [[number, number], [number, number]];
      }>
    ) => {
      const { categoryId, layerId, bounds } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (!layer) return;

      layer.bounds = bounds;
    },
    clearActiveLayers: (state) => {
      Object.entries(state.categories).forEach(([categoryId, category]) => {
        if (categoryId !== 'basemaps') {
          category.layers.forEach(layer => {
            layer.active = false;
          });
        }
      });
    },
    setLayerValueRange: (
      state,
      action: PayloadAction<{
        categoryId: string;
        layerId: number;
        min: number;
        max: number;
      }>
    ) => {
      const { categoryId, layerId, min, max } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (layer && layer.valueRange) {
        layer.valueRange.min = min;
        layer.valueRange.max = max;
      }
    },
    initializeLayerValueRange: (
      state,
      action: PayloadAction<{
        categoryId: string;
        layerId: number;
        min: number;
        max: number;
      }>
    ) => {
      const { categoryId, layerId, min, max } = action.payload;
      const category = state.categories[categoryId];
      
      if (!category) return;

      const layer = category.layers.find(l => l.id === layerId);
      if (layer) {
        layer.valueRange = {
          min,
          max,
          defaultMin: min,
          defaultMax: max
        };
      }
    },
    setSlopeRenderingRule: (
      state,
      action: PayloadAction<string>
    ) => {
      state.slopeRenderingRule = action.payload;
    }
  }
});

export const { 
  toggleLayer, 
  toggleSingleLayer, 
  setLayerOpacity,
  bringLayerToFront,
  sendLayerToBack,
  bringLayerForward,
  sendLayerBackward,
  setLayerBounds,
  clearActiveLayers,
  setLayerValueRange,
  initializeLayerValueRange,
  setSlopeRenderingRule
} = layersSlice.actions;

export default layersSlice.reducer;