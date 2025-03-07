import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MapLayer, LayerCategory } from '../../types/map';
import { TILE_LAYERS, SERVICE_LAYERS, GEOTIFF_LAYERS } from '../../constants/urls';

interface LayersState {
  categories: {
    [key: string]: LayerCategory;
  };
  loading: boolean;
  error: string | null;
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
      { name: 'WUI', type: 'tile', source: SERVICE_LAYERS.WUI },
      { name: 'Wildfire Crisis Areas', type: 'vector' },
      { name: 'Priority Treatment Areas', type: 'vector' }
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
    landscape: createInitialCategory('landscape', 'Landscape', [
      { name: 'Slope Steepness', type: 'raster' },
      { name: 'Timber Base', type: 'vector' },
      { name: 'Roadless Areas', type: 'vector' },
      { name: 'Wilderness Areas', type: 'vector' },
      { name: 'Cultural Areas', type: 'vector' }
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
  error: null
};

const getHighestLayerOrder = (state: LayersState): number => {
  let highestOrder = 0;
  
  Object.values(state.categories).forEach(cat => {
    cat.layers.forEach(l => {
      if (l.type === 'geotiff' && l.order !== undefined) {
        highestOrder = Math.max(highestOrder, l.order);
      }
    });
  });
  
  return highestOrder;
};

const isGeoTiffLayer = (layer: MapLayer): boolean => {
  return layer.type === 'geotiff';
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
        category.layers.forEach(l => {
          l.active = l.id === layerId;
        });
      } else {
        if (!layer.active && layer.type === 'geotiff') {
          const highestOrder = getHighestLayerOrder(state);
          layer.order = highestOrder + 10;
        }
        
        layer.active = !layer.active;
      }
    },
    toggleSingleLayer: (
      state,
      action: PayloadAction<{ categoryId: string; layerId: number }>
    ) => {
      const { categoryId, layerId } = action.payload;
      
      if (categoryId === 'basemaps') {
        return;
      }

      const category = state.categories[categoryId];
      if (!category) return;
      
      const targetLayer = category.layers.find(l => l.id === layerId);
      if (!targetLayer) return;

      const isTargetGeoTiff = isGeoTiffLayer(targetLayer);

      if (isTargetGeoTiff) {
        if (state.categories.firemetrics) {
          state.categories.firemetrics.layers.forEach(layer => {
            if (isGeoTiffLayer(layer) && !(categoryId === 'firemetrics' && layer.id === layerId)) {
              layer.active = false;
            }
          });
        }
        
        if (state.categories.fuels) {
          state.categories.fuels.layers.forEach(layer => {
            if (isGeoTiffLayer(layer) && !(categoryId === 'fuels' && layer.id === layerId)) {
              layer.active = false;
            }
          });
        }
      } else {
        category.layers.forEach(layer => {
          if (layer.id !== layerId) {
            layer.active = false;
          }
        });
      }
      
      if (isTargetGeoTiff) {
        const highestOrder = getHighestLayerOrder(state);
        targetLayer.order = highestOrder + 10;
      }
      
      targetLayer.active = true;
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

      const highestOrder = getHighestLayerOrder(state);
      
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

      let lowestOrder = Infinity;
      
      Object.values(state.categories).forEach(cat => {
        cat.layers.forEach(l => {
          if (l.type === 'geotiff' && l.order !== undefined) {
            lowestOrder = Math.min(lowestOrder, l.order);
          }
        });
      });
      
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

      const allGeoTiffLayers: { layer: MapLayer, categoryId: string }[] = [];
      
      Object.entries(state.categories).forEach(([catId, cat]) => {
        cat.layers.forEach(l => {
          if (l.type === 'geotiff' && l.order !== undefined) {
            allGeoTiffLayers.push({ layer: l, categoryId: catId });
          }
        });
      });
      
      allGeoTiffLayers.sort((a, b) => {
        if (a.layer.order === undefined || b.layer.order === undefined) return 0;
        return a.layer.order - b.layer.order;
      });
      
      for (let i = 0; i < allGeoTiffLayers.length - 1; i++) {
        if (allGeoTiffLayers[i].layer.id === layer.id && 
            allGeoTiffLayers[i].categoryId === categoryId) {
          const nextLayer = allGeoTiffLayers[i + 1].layer;
          if (nextLayer.order !== undefined) {
            const temp = layer.order;
            layer.order = nextLayer.order;
            nextLayer.order = temp;
          }
          break;
        }
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

      const allGeoTiffLayers: { layer: MapLayer, categoryId: string }[] = [];
      
      Object.entries(state.categories).forEach(([catId, cat]) => {
        cat.layers.forEach(l => {
          if (l.type === 'geotiff' && l.order !== undefined) {
            allGeoTiffLayers.push({ layer: l, categoryId: catId });
          }
        });
      });
      
      allGeoTiffLayers.sort((a, b) => {
        if (a.layer.order === undefined || b.layer.order === undefined) return 0;
        return a.layer.order - b.layer.order;
      });
      
      for (let i = 1; i < allGeoTiffLayers.length; i++) {
        if (allGeoTiffLayers[i].layer.id === layer.id && 
            allGeoTiffLayers[i].categoryId === categoryId) {
          const prevLayer = allGeoTiffLayers[i - 1].layer;
          if (prevLayer.order !== undefined) {
            const temp = layer.order;
            layer.order = prevLayer.order;
            prevLayer.order = temp;
          }
          break;
        }
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
  initializeLayerValueRange
} = layersSlice.actions;

export default layersSlice.reducer;