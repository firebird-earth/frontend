import React from 'react';
import { Building, Home, Warehouse, Share2, Flame, Zap, Ruler, ThermometerSun, Shield, Network, Trees, Skull } from 'lucide-react';
import SectionHeader from '../SectionHeader';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { toggleSection } from '../../../store/slices/uiSlice';
import { toggleLayer } from '../../../store/slices/layersSlice';

const FireMetricsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.ui.sections);
  const firemetricLayers = useAppSelector(state => state.layers.categories.firemetrics?.layers || []);
  const fuelLayers = useAppSelector(state => state.layers.categories.fuels?.layers || []);

  const handleLayerClick = (categoryId: string, layerId: number) => {
    dispatch(toggleLayer({ categoryId, layerId }));
  };

  const getLayerIcon = (name: string) => {
    switch (name) {
      case 'Burn Probability':
        return Flame;
      case 'Initial Fire Size':
        return Zap;
      case 'Flame Length':
        return Ruler;
      case 'Fire Intensity':
        return ThermometerSun;
      case 'Suppression Difficulty':
        return Shield;
      case 'Transmission Index':
      case 'Transmission Influence':
        return Network;
      case 'Canopy Bulk Density':
      case 'Canopy Cover':
      case 'Canopy Height':
        return Trees;
      case 'Mortality':
        return Skull;
      default:
        return Flame;
    }
  };

  return (
    <div className="space-y-3">
      {/* Value At Risk Section */}
      <div>
        <SectionHeader 
          title="Value At Risk" 
          isOpen={sections.valueAtRisk} 
          onToggle={() => dispatch(toggleSection('valueAtRisk'))}
        />
        {sections.valueAtRisk && (
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Firesheds</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Home className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Structure Burn Frequency</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Warehouse className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Structure Burn Hazard</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Share2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Structure Burn Influence</span>
            </button>
          </div>
        )}
      </div>

      {/* Landscape Risk Section */}
      <div>
        <SectionHeader 
          title="Landscape Risk" 
          isOpen={sections.landscapeRisk} 
          onToggle={() => dispatch(toggleSection('landscapeRisk'))}
        />
        {sections.landscapeRisk && (
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Flame className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Burn Probability</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Initial Fire Size</span>
            </button>
            {firemetricLayers.map(layer => {
              const Icon = getLayerIcon(layer.name);
              return (
                <button
                  key={layer.id}
                  onClick={() => handleLayerClick('firemetrics', layer.id)}
                  className={`w-full flex items-center space-x-2 p-1 text-sm ${
                    layer.active 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } rounded-lg`}
                >
                  <Icon className={`h-4 w-4 ${
                    layer.active 
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span>{layer.name}</span>
                </button>
              );
            })}
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <ThermometerSun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Fire Intensity</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Suppression Difficulty</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Network className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Transmission Index</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
              <Share2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Transmission Influence</span>
            </button>
          </div>
        )}
      </div>

      {/* Fuels Section */}
      <div>
        <SectionHeader 
          title="Fuels" 
          isOpen={sections.fuels} 
          onToggle={() => dispatch(toggleSection('fuels'))}
        />
        {sections.fuels && (
          <div className="space-y-1">
            {fuelLayers.map(layer => {
              const Icon = getLayerIcon(layer.name);
              return (
                <button
                  key={layer.id}
                  onClick={() => handleLayerClick('fuels', layer.id)}
                  className={`w-full flex items-center space-x-2 p-1 text-sm ${
                    layer.active 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } rounded-lg`}
                >
                  <Icon className={`h-4 w-4 ${
                    layer.active 
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span>{layer.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FireMetricsTab;