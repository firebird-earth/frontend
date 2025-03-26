import React, { useState } from 'react';
import { Building, Home, Warehouse, Share2, Flame, Zap, Ruler, ThermometerSun, Shield, Network, Trees, Skull, Eye, EyeOff } from 'lucide-react';
import SectionHeader from '../SectionHeader';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { toggleSection } from '../../../store/slices/uiSlice';
import { toggleLayer, toggleSingleLayer } from '../../../store/slices/layers';
import SelectAOIDialog from '../../aoi/SelectAOIDialog';

const FireMetricsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.ui.sections);
  const firemetricLayers = useAppSelector(state => state.layers.categories.firemetrics?.layers || []);
  const fuelLayers = useAppSelector(state => state.layers.categories.fuels?.layers || []);
  const valueAtRiskLayers = useAppSelector(state => state.layers.categories.valueAtRisk?.layers || []);
  const landscapeRiskLayers = useAppSelector(state => state.layers.categories.landscapeRisk?.layers || []);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const [showDialog, setShowDialog] = useState(false);

  // Handle click on the layer text/name - exclusive behavior
  const handleLayerClick = (categoryId: string, layerId: number) => {
    // Check if an AOI is selected
    if (!currentAOI) {
      setShowDialog(true);
      return;
    }
    
    // Use toggleSingleLayer for exclusive behavior
    dispatch(toggleSingleLayer({ categoryId, layerId }));
  };

  // Handle click on the eye icon - non-exclusive behavior
  const handleEyeClick = (e: React.MouseEvent, categoryId: string, layerId: number) => {
    e.stopPropagation();
    
    if (!currentAOI) {
      setShowDialog(true);
      return;
    }
    
    // Use toggleLayer for non-exclusive behavior
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
      case 'Firesheds':
        return Building;
      case 'Structure Burn Frequency':
      case 'Structure Burn Hazard':
        return Home;
      case 'Structure Burn Influence':
        return Share2;
      default:
        return Flame;
    }
  };

  // Helper function to render a layer item with consistent styling
  const renderLayerItem = (layer: any, categoryId: string) => {
    const Icon = getLayerIcon(layer.name);
    return (
      <div
        key={`${categoryId}-${layer.id}`}
        onClick={() => handleLayerClick(categoryId, layer.id)}
        className={`
          flex items-center justify-between p-1 rounded-lg cursor-pointer
          ${layer.active 
            ? 'bg-blue-50 dark:bg-blue-900/20' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          }
        `}
      >
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${
            layer.active 
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`} />
          <span className={`text-sm ${
            layer.active 
              ? 'text-blue-700 dark:text-blue-300 font-medium'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {layer.name}
          </span>
        </div>
        <button 
          onClick={(e) => handleEyeClick(e, categoryId, layer.id)}
          className={`${
            layer.active 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {layer.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
    );
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
            {valueAtRiskLayers.map(layer => renderLayerItem(layer, 'valueAtRisk'))}
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
            {firemetricLayers.map(layer => renderLayerItem(layer, 'firemetrics'))}
            {landscapeRiskLayers.map(layer => renderLayerItem(layer, 'landscapeRisk'))}
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
            {fuelLayers.map(layer => renderLayerItem(layer, 'fuels'))}
          </div>
        )}
      </div>

      {/* SelectAOI Dialog */}
      {showDialog && (
        <SelectAOIDialog onClose={() => setShowDialog(false)} />
      )}
    </div>
  );
};

export default FireMetricsTab;