import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { LayerType } from '../../../types/map';
import { useAppSelector } from '../../../hooks/useAppSelector';

interface TileLayerProps {
  active: boolean;
  opacity?: number;
  url: string;
  maxZoom?: number;
  attribution?: string;
  className?: string;
}

interface LayerConfig {
  name: string;
  description: string;
  source: string;
  type: LayerType;
  legend?: {
    items: Array<{
      color: string;
      label: string;
    }>;
  };
}

export function createTileLayer(categoryId: string, config: LayerConfig) {
  const TileLayerInstance: React.FC<{ active: boolean }> = ({ active }) => {
    const opacity = useAppSelector(state => {
      const category = state.layers.categories[categoryId];
      if (!category) return 1.0;
      const layer = category.layers.find(l => l.name === config.name);
      return layer?.opacity ?? 1.0;
    });

    return (
      <BaseTileLayer
        active={active}
        opacity={opacity}
        url={config.source}
        maxZoom={22}
        attribution={config.description}
        className={`tile-layer-${config.name.toLowerCase().replace(/\s+/g, '-')}`}
      />
    );
  };

  // Add Legend component if legend config exists
  if (config.legend) {
    TileLayerInstance.Legend = () => (
      <div className="space-y-2">
        {config.legend.items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">
              {item.label}
            </span>
          </div>
        ))}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
          Source: {config.description}
        </div>
      </div>
    );
  }

  TileLayerInstance.displayName = `${config.name}Layer`;
  return TileLayerInstance;
}

const BaseTileLayer: React.FC<TileLayerProps> = ({
  active,
  opacity = 1,
  url,
  maxZoom = 22,
  attribution,
  className
}) => {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);
  const opacityRef = useRef(opacity);
  const urlRef = useRef(url);

  // Handle opacity changes separately
  useEffect(() => {
    if (layerRef.current && opacityRef.current !== opacity) {
      opacityRef.current = opacity;
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  // Handle layer creation/removal and URL changes
  useEffect(() => {
    // If URL changes, remove old layer first
    if (urlRef.current !== url) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      urlRef.current = url;
    }

    // Handle layer creation/removal
    if (active && !layerRef.current) {
      const layer = L.tileLayer(url, {
        attribution,
        maxZoom,
        opacity: opacityRef.current,
        className,
        tms: false,
        detectRetina: true,
        // Performance optimizations
        updateWhenZooming: false,
        updateWhenIdle: true,
        keepBuffer: 4,
        maxNativeZoom: 18,
        minZoom: 4,
        bounds: L.latLngBounds(
          [24.396308, -125.000000],
          [49.384358, -66.934570]
        ),
        // Caching improvements
        crossOrigin: true,
        subdomains: 'abc',
        zoomOffset: 0,
        errorTileUrl: '',
        // Loading optimizations
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        // Rendering improvements
        className: `${className} leaflet-tile-loaded`,
        fadeAnimation: false
      });

      layer.on('loading', () => {
        layer.getContainer()?.classList.add('is-loading');
      });

      layer.on('load', () => {
        layer.getContainer()?.classList.remove('is-loading');
      });

      layer.addTo(map);
      layerRef.current = layer;
    } else if (!active && layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [active, url, map, maxZoom, attribution, className]);

  return null;
};

export default BaseTileLayer;