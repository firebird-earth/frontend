import React, { useEffect, useState } from 'react';
import { getBrightness } from '../../../utils/colorUtils';

interface LegendItem {
  label: string;
  imageData: string;
  values: string[];
}

const WUILegend: React.FC = () => {
  const [legendItems, setLegendItems] = useState<LegendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLegend = async () => {
      try {
        const response = await fetch('https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_WUI_2020_01/MapServer/legend?f=json');
        if (!response.ok) {
          throw new Error('Failed to fetch legend data');
        }

        const data = await response.json();
        
        if (!data.layers || !Array.isArray(data.layers)) {
          throw new Error('Invalid legend data structure');
        }

        const items: LegendItem[] = data.layers.flatMap(layer => 
          layer.legend.map((item: any) => ({
            label: item.label,
            imageData: item.imageData,
            values: item.values || []
          }))
        );

        const itemsWithBrightness = await Promise.all(
          items.map(async (item) => ({
            ...item,
            brightness: await getBrightness(item.imageData)
          }))
        );

        const sortedItems = itemsWithBrightness
          .sort((a, b) => a.brightness - b.brightness)
          .map(({ brightness, ...item }) => item);

        setLegendItems(sortedItems);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching legend:', err);
        setError(err instanceof Error ? err.message : 'Failed to load legend');
        setIsLoading(false);
      }
    };

    fetchLegend();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-500 dark:text-red-400">
        Error loading legend: {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <img 
            src={`data:image/png;base64,${item.imageData}`}
            alt={item.label}
            className="w-6 h-6"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {item.label}
          </span>
        </div>
      ))}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
        Source: USFS WUI 2020
      </div>
    </div>
  );
};

export default WUILegend;