import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as GeoTIFF from 'geotiff';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { loadGeoTiffFromUrl, validateGeoTiff, getGeoTiffBounds } from '../../../utils/geotif/utils';
import { getColorScheme, getColorFromScheme, hexToRgb } from '../../../utils/colors';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setLayerBounds, initializeLayerValueRange } from '../../../store/slices/layersSlice';
import { getGeoTiffUrl } from '../../../constants/urls';

interface GeoTiffLayerProps {
  url: string;
  active: boolean;
  zIndex?: number;
  categoryId?: string;
  layerId?: number;
}

const GeoTiffLayer: React.FC<GeoTiffLayerProps> = ({ 
  url, 
  active, 
  zIndex = 0,
  categoryId,
  layerId 
}) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const layerRef = useRef<L.ImageOverlay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const urlRef = useRef<string>(url);
  const zIndexRef = useRef<number>(zIndex);
  const boundsRef = useRef<L.LatLngBounds | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  
  const currentAOI = useAppSelector(state => state.aoi.currentAOI);
  const isCreatingAOI = useAppSelector(state => state.ui.isCreatingAOI);
  
  const opacity = useAppSelector(state => {
    if (!categoryId || !layerId) return 1;
    const category = state.layers.categories[categoryId];
    if (!category) return 1;
    const layer = category.layers.find(l => l.id === layerId);
    return layer?.opacity ?? 1;
  });

  const valueRange = useAppSelector(state => {
    if (!categoryId || !layerId) return null;
    const category = state.layers.categories[categoryId];
    if (!category) return null;
    const layer = category.layers.find(l => l.id === layerId);
    return layer?.valueRange;
  });
  
  const opacityRef = useRef<number>(opacity);
  
  const effectiveUrl = React.useMemo(() => {
    if (!currentAOI) {
      return url;
    }
    
    const aoiId = 'id' in currentAOI ? currentAOI.id : 1;
    const layerName = url.split('/').pop()?.replace('.tif', '') || '';
    return getGeoTiffUrl(aoiId, layerName);
  }, [url, currentAOI]);
  
  useEffect(() => {
    if (urlRef.current !== effectiveUrl) {
      if (layerRef.current) {
        console.log('Removing GeoTIFF layer due to URL change');
        map.removeLayer(layerRef.current);
        layerRef.current = null;
        imageUrlRef.current = null;
        boundsRef.current = null;
      }
      urlRef.current = effectiveUrl;
    }
  }, [effectiveUrl, map]);

  useEffect(() => {
    if (layerRef.current && zIndexRef.current !== zIndex) {
      layerRef.current.setZIndex(zIndex);
      zIndexRef.current = zIndex;
    }
  }, [zIndex]);
  
  useEffect(() => {
    if (layerRef.current && opacityRef.current !== opacity) {
      layerRef.current.setOpacity(opacity);
      opacityRef.current = opacity;
    }
  }, [opacity]);

  useEffect(() => {
    if (!active) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      setError(null);
      setLoading(false);
      setProgress(0);
      return;
    }
    
    if (!currentAOI) {
      setError("Please select an Area of Interest (AOI) first");
      setLoading(false);
      return;
    }

    if (layerRef.current && imageUrlRef.current && boundsRef.current) {
      layerRef.current.setOpacity(opacity);
      layerRef.current.setZIndex(zIndex);
      return;
    }

    const loadGeoTiff = async () => {
      try {
        setError(null);
        setLoading(true);
        setProgress(0);

        console.log('Starting GeoTIFF layer load for URL:', effectiveUrl);

        const arrayBuffer = await loadGeoTiffFromUrl(effectiveUrl, setProgress);
        validateGeoTiff(arrayBuffer);

        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        if (!image) throw new Error('No image found in GeoTIFF');

        const width = image.getWidth();
        const height = image.getHeight();
        console.log('GeoTIFF dimensions:', { width, height });

        console.log('Calculating GeoTIFF bounds...');
        const boundsInfo = await getGeoTiffBounds(image);
        console.log('GeoTIFF bounds info:', boundsInfo);

        const leafletBounds = L.latLngBounds(boundsInfo.bounds);
        
        console.log('Reading raster data...');
        const rasters = await image.readRasters();
        if (!rasters || !rasters[0]) throw new Error('No raster data found');

        const data = rasters[0] as Int16Array;
        console.log('Raster data info:', {
          length: data.length,
          type: data.constructor.name,
          sampleValues: Array.from(data.slice(0, 5))
        });

        const rawNoData = image.fileDirectory.GDAL_NODATA;
        console.log('Raw NODATA value:', rawNoData);
        const noDataValue = rawNoData !== undefined
          ? Number(rawNoData.replace('\x00', ''))
          : null;
        console.log('Parsed NODATA value:', noDataValue);

        console.log('Calculating data range...');
        let min = Infinity;
        let max = -Infinity;
        let validCount = 0;
        let noDataCount = 0;
        let nanCount = 0;
        let infCount = 0;
        let zeroCount = 0;

        for (let i = 0; i < data.length; i++) {
          const value = data[i];
          if (
            value !== undefined &&
            !isNaN(value) &&
            (noDataValue === null || value !== noDataValue)
          ) {
            if (!isFinite(value)) {
              infCount++;
              continue;
            }
            if (value === 0) {
              zeroCount++;
            }
            min = Math.min(min, value);
            max = Math.max(max, value);
            validCount++;
          } else if (isNaN(value)) {
            nanCount++;
          } else if (noDataValue !== null && value === noDataValue) {
            noDataCount++;
          }
        }

        console.log('Data statistics:', {
          min,
          max,
          validCount,
          noDataCount,
          nanCount,
          infCount,
          zeroCount,
          totalPixels: width * height
        });

        if (min === Infinity || max === -Infinity) {
          throw new Error('No valid data values found');
        }

        if (categoryId && layerId && !valueRange) {
          dispatch(initializeLayerValueRange({
            categoryId,
            layerId,
            min,
            max
          }));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        const imageData = ctx.createImageData(width, height);
        
        let colorScheme;
        if (effectiveUrl.includes('burn_probability')) {
          colorScheme = getColorScheme('burnProbability');
        } else if (effectiveUrl.includes('canopy_cover')) {
          colorScheme = getColorScheme('canopyCover');
        } else if (effectiveUrl.includes('flame_length')) {
          colorScheme = getColorScheme('fireIntensity');
        } else {
          colorScheme = getColorScheme('greenYellowRed');
        }
        
        if (!colorScheme) {
          colorScheme = getColorScheme('greenYellowRed');
        }
        
        const noDataColor = { r: 0, g: 0, b: 0, a: 0 };
        const zeroValueColor = { r: 0, g: 0, b: 255, a: 255 };
        
        let validPixelsInVisualization = 0;
        let noDataPixelsInVisualization = 0;
        let zeroPixelsInVisualization = 0;

        const effectiveMin = min;
        const effectiveMax = max;
        const effectiveRange = effectiveMax - effectiveMin;

        for (let i = 0; i < data.length; i++) {
          const value = data[i];
          const idx = i * 4;

          if (
            value === undefined ||
            isNaN(value) ||
            !isFinite(value) ||
            (noDataValue !== null && value === noDataValue)
          ) {
            imageData.data[idx] = noDataColor.r;
            imageData.data[idx + 1] = noDataColor.g;
            imageData.data[idx + 2] = noDataColor.b;
            imageData.data[idx + 3] = noDataColor.a;
            noDataPixelsInVisualization++;
            continue;
          }
          
          if (value === 0) {
            imageData.data[idx] = zeroValueColor.r;
            imageData.data[idx + 1] = zeroValueColor.g;
            imageData.data[idx + 2] = zeroValueColor.b;
            imageData.data[idx + 3] = zeroValueColor.a;
            zeroPixelsInVisualization++;
            continue;
          }

          // Filter out values outside the current range
          if (valueRange && (value < valueRange.min || value > valueRange.max)) {
            imageData.data[idx] = noDataColor.r;
            imageData.data[idx + 1] = noDataColor.g;
            imageData.data[idx + 2] = noDataColor.b;
            imageData.data[idx + 3] = noDataColor.a;
            continue;
          }

          // Calculate color based on absolute value position in the full range
          const normalizedValue = (value - effectiveMin) / effectiveRange;
          const color = getColorFromScheme(colorScheme, normalizedValue);
          const { r, g, b } = hexToRgb(color);
          
          imageData.data[idx] = r;
          imageData.data[idx + 1] = g;
          imageData.data[idx + 2] = b;
          imageData.data[idx + 3] = 255;

          validPixelsInVisualization++;
        }

        console.log('Visualization statistics:', {
          validPixels: validPixelsInVisualization,
          noDataPixels: noDataPixelsInVisualization,
          zeroPixels: zeroPixelsInVisualization,
          totalPixels: width * height
        });

        ctx.putImageData(imageData, 0, 0);

        if (layerRef.current) {
          console.log('Removing previous GeoTIFF layer');
          map.removeLayer(layerRef.current);
          layerRef.current = null;
        }

        console.log('Creating image overlay...');
        const imageUrl = canvas.toDataURL();
        imageUrlRef.current = imageUrl;
        
        const layer = L.imageOverlay(imageUrl, leafletBounds, {
          opacity: opacity,
          interactive: false,
          zIndex: zIndex,
          className: 'geotiff-high-quality'
        });

        console.log(`Adding layer to map with zIndex: ${zIndex}`);
        layer.addTo(map);
        layerRef.current = layer;
        zIndexRef.current = zIndex;
        opacityRef.current = opacity;

        boundsRef.current = leafletBounds;

        if (categoryId && layerId) {
          dispatch(setLayerBounds({
            categoryId,
            layerId,
            bounds: boundsInfo.bounds
          }));
        }

        console.log('GeoTIFF layer added successfully');
        setLoading(false);
        setProgress(100);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('GeoTIFF layer error:', err);
        setError(message);
        setLoading(false);
      }
    };

    loadGeoTiff();

    return () => {
      if (layerRef.current) {
        console.log('Cleaning up GeoTIFF layer');
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, effectiveUrl, active, dispatch, categoryId, layerId, currentAOI, isCreatingAOI, valueRange, zIndex]);

  if (loading) {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              Loading GeoTIFF...
            </div>
            <div className="mt-1 relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {progress}% complete
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-md">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Failed to load GeoTIFF
            </h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GeoTiffLayer;