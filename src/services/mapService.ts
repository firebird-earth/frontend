import L from 'leaflet';
import { MapLayer } from '../types/map';

class MapService {
  private static instance: MapService;
  private layerCache: Map<string, L.Layer> = new Map();

  private constructor() {}

  public static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  public createLayer(layerConfig: MapLayer): L.Layer {
    const cacheKey = `${layerConfig.id}-${layerConfig.type}`;
    
    if (this.layerCache.has(cacheKey)) {
      return this.layerCache.get(cacheKey)!;
    }

    let layer: L.Layer;

    switch (layerConfig.type) {
      case 'tile':
        layer = L.tileLayer(layerConfig.source, {
          attribution: layerConfig.attribution,
          maxZoom: layerConfig.maxZoom,
          minZoom: layerConfig.minZoom,
          opacity: layerConfig.opacity
        });
        break;
      
      case 'vector':
        layer = L.geoJSON(undefined, {
          style: {
            color: '#2563eb',
            weight: 2,
            fillColor: '#2563eb',
            fillOpacity: 0.1,
            opacity: layerConfig.opacity || 1
          }
        });
        break;
      
      default:
        throw new Error(`Unsupported layer type: ${layerConfig.type}`);
    }

    this.layerCache.set(cacheKey, layer);
    return layer;
  }

  public clearCache(): void {
    this.layerCache.clear();
  }
}

export const mapService = MapService.getInstance();