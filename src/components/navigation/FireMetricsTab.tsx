import React, { useState } from 'react';
import { Building, Home, Warehouse, Share2, Flame, Zap, Ruler, ThermometerSun, Shield, Network} from 'lucide-react'; 
import { Trees, Skull, Eye, EyeOff, AlertTriangle, Clock10 } from 'lucide-react'; 
import SectionHeader from './SectionHeader';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleSection } from '../../store/slices/uiSlice';
import { toggleLayer, toggleSingleLayer } from '../../store/slices/layersSlice';
import SelectAOIDialog from '../aoi/SelectAOIDialog';
import { FIRE_METRICS } from '../../constants/maps';

const FireMetricsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.ui.sections);
  const fuelLayers = useAppSelector(state => state.layers.categories.fuels?.layers || []);
  const valueAtRiskLayers = useAppSelector(state => state.layers.categories.structureRisk?.layers || []);
  const landscapeRiskLayers = useAppSelector(state => state.layers.categories.landscapeRisk?.layers || []);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const [showDialog, setShowDialog] = useState(false);

  const getLayerIcon = (name: string) => {
    // Value at Risk icons
    if (name === FIRE_METRICS.VALUE_AT_RISK.FIRESHEDS.name) return Clock10;
    if (name === FIRE_METRICS.VALUE_AT_RISK.STRUCTURE_BURN_FREQUENCY.name) return Home;
    if (name === FIRE_METRICS.VALUE_AT_RISK.STRUCTURE_BURN_HAZARD.name) return AlertTriangle;
    if (name === FIRE_METRICS.VALUE_AT_RISK.STRUCTURE_BURN_INFLUENCE.name) return Share2;

    // Landscape Risk icons
    if (name === FIRE_METRICS.LANDSCAPE_RISK.BURN_PROBABILITY.name) return Flame;
    if (name === FIRE_METRICS.LANDSCAPE_RISK.FLAME_LENGTH.name) return Ruler;
    if (name === FIRE_METRICS.LANDSCAPE_RISK.FIRE_INTENSITY.name) return ThermometerSun;
    if (name === FIRE_METRICS.LANDSCAPE_RISK.SUPPRESSION_DIFFICULTY.name) return Shield;
    if (name === FIRE_METRICS.LANDSCAPE_RISK.EXPLOSIVE_FIRE_RISK.name) return AlertTriangle;
    if (name === FIRE_METRICS.LANDSCAPE_RISK.TRANSMISSION_INFLUENCE.name) return Share2;

    // Fuels icons
    if (name === FIRE_METRICS.FUELS.CANOPY_BULK_DENSITY.name) return Trees;
    if (name === FIRE_METRICS.FUELS.CANOPY_COVER.name) return Trees;
    if (name === FIRE_METRICS.FUELS.CANOPY_HEIGHT.name) return Trees;
    if (name === FIRE_METRICS.FUELS.MORTALITY.name) return Skull;

    // Default icon
    return Flame;
  };

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
      
      {/* Landscape Risk Section */}
      <div>
        <SectionHeader 
          title={FIRE_METRICS.LANDSCAPE_RISK.label}
          isOpen={sections.landscapeRisk} 
          onToggle={() => dispatch(toggleSection(FIRE_METRICS.LANDSCAPE_RISK.name))}
        />
        {sections.landscapeRisk && (
          <div className="space-y-1">
            {landscapeRiskLayers.map(layer => renderLayerItem(layer, FIRE_METRICS.LANDSCAPE_RISK.name))}
          </div>
        )}
      </div>

      {/* Value At Risk Section */}
      <div>
        <SectionHeader 
          title={FIRE_METRICS.VALUE_AT_RISK.label}
          isOpen={sections.structureRisk} 
          onToggle={() => dispatch(toggleSection(FIRE_METRICS.VALUE_AT_RISK.name))}
        />
        {sections.structureRisk && (
          <div className="space-y-1">
            {valueAtRiskLayers.map(layer => renderLayerItem(layer, FIRE_METRICS.VALUE_AT_RISK.name))}
          </div>
        )}
      </div>
      
      {/* Fuels Section */}
      <div>
        <SectionHeader 
          title={FIRE_METRICS.FUELS.label}
          isOpen={sections.fuels} 
          onToggle={() => dispatch(toggleSection(FIRE_METRICS.FUELS.name))}
        />
        {sections.fuels && (
          <div className="space-y-1">
            {fuelLayers.map(layer => renderLayerItem(layer, FIRE_METRICS.FUELS.name))}
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