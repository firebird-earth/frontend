import React from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getColorScheme } from '../../utils/colors';
import { resolveDomain } from '../../utils/rasterDomain';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[GeoTiffLegend]', ...args);
}

interface GeoTiffLegendProps {
  categoryId: string;
  layerId: number;
}

const GeoTiffLegend: React.FC<GeoTiffLegendProps> = React.memo(({ categoryId, layerId }) => {
  log('lookup layer', { categoryId, layerId });

  // Get layer from Redux store
  const layer = useAppSelector(state => {
    const category = state.layers.categories[categoryId];
    return category?.layers.find(l => l.id === layerId) ?? null;
  });

  // Placeholder if not ready
  if (!layer?.metadata?.stats || !layer.colorScheme || !layer.valueRange) {
    log('layer not ready, display placeholder');
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="h-4 w-full rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        </div>
      </div>
    );
  }

  // Extract full range and current value range, fallback if default equals NoData
  const metadata = layer.metadata;
  const { min: dataMin, max: dataMax } = metadata.stats;
  const noDataValue = (metadata as any).noDataValue;

  // Resolve full domain, replacing nodata endpoints with actual stats
  const [fullDomainMin, fullDomainMax] = resolveDomain(
    [layer.valueRange.defaultMin, layer.valueRange.defaultMax],
    dataMin,
    dataMax,
    noDataValue
  );

  const { min: vrMin, max: vrMax } = layer.valueRange;

  // Helper to apply format strings like "{value:.1f}X"
  const applyValueFormat = (fmt: string, v: number): string => {
    const m = fmt.match(/^(.*)\{value:(\.[0-9]+f)\}(.*)$/);
    if (m) {
      const [, prefix, spec, suffix] = m;
      const decimals = parseInt(spec.slice(1, -1), 10);
      return prefix + v.toFixed(decimals) + suffix;
    }
    return v.toString();
  };

  // Determine format strings for min/max
  const fmtMinStr = (layer as any).valueFormatMin ?? (layer as any).valueFormat ?? '{value:.1f}';
  const fmtMaxStr = (layer as any).valueFormatMax ?? (layer as any).valueFormat ?? '{value:.1f}';
  // Handle NoData fallback: if vr equals noData, use actual data stats
  const effVrMin = vrMin === noDataValue ? dataMin : vrMin;
  const effVrMax = vrMax === noDataValue ? dataMax : vrMax;
  const legendMin = applyValueFormat(fmtMinStr, effVrMin);
  const legendMax = applyValueFormat(fmtMaxStr, effVrMax);

  // Build clipped gradient
  const scheme = getColorScheme(layer.colorScheme.name);
  const fullColors = scheme.colors;
  const n = fullColors.length;
  // Build clipped gradient using effective value range
  const startIdx = Math.floor(((effVrMin - fullDomainMin) / (fullDomainMax - fullDomainMin)) * (n - 1));
  const endIdx = Math.ceil(((effVrMax - fullDomainMin) / (fullDomainMax - fullDomainMin)) * (n - 1));
  const i0 = Math.max(0, Math.min(n - 1, startIdx));
  const i1 = Math.max(0, Math.min(n - 1, endIdx));
  const clipped = fullColors.slice(i0, i1 + 1);
  const stops = clipped.map((c, i) => `${c} ${(i / (clipped.length - 1)) * 100}%`).join(', ');
  const gradient = `linear-gradient(to right, ${stops})`;

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="h-4 w-full rounded" style={{ background: gradient }} />
        <div className="flex justify-between text-xs text-gray-600">
          <span className="font-bold">{legendMin}</span>
          <span className="font-bold">{legendMax}</span>
        </div>
        <div className="text-xs text-gray-600 text-center font-bold">
          {layer.units || 'units'}
        </div>
      </div>
    </div>
  );
});

GeoTiffLegend.displayName = 'GeoTiffLegend';

export default GeoTiffLegend;
