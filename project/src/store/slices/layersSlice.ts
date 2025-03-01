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
        active: false
      }
    ]),
    fuels: createInitialCategory('fuels', 'Fuels', [
      { 
        name: 'Canopy Cover', 
        type: 'geotiff',
        source: GEOTIFF_LAYERS.CANOPY_COVER,
        active: false
      },
      { 
        name: 'Canopy Height', 
        type: 'geotiff',
        source: GEOTIFF_LAYERS.CANOPY_HEIGHT,
        active: false
      },
      { 
        name: 'Canopy Bulk Density', 
        type: 'geotiff',
        source: GEOTIFF_LAYERS.CANOPY_BULK_DENSITY,
        active: false // Set back to inactive by default
      },
      { 
        name: 'Mortality', 
        type: 'placeholder', // Changed from 'geotiff' to 'placeholder' so it doesn't load any data
        source: '', // Removed the source
        active: false
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

      // Modified to only turn off layers in the same category
      // This allows layers from different categories to remain active
      const category = state.categories[categoryId];
      if (category) {
        // Turn off other layers in the same category
        category.layers.forEach(layer => {
          if (layer.id !== layerId) {
            layer.active = false;
          }
        });
        
        // Turn on the selected layer
        const layer = category.layers.find(l => l.id === layerId);
        if (layer) {
          layer.active = true;
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
    }
  }
});

export const { toggleLayer, toggleSingleLayer, setLayerOpacity } = layersSlice.actions;
export default layersSlice.reducer;