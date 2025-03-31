import React, { useState } from 'react';
import { MoreVertical, Eye, EyeOff, Plus } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleSection } from '../../store/slices/uiSlice';
import { toggleLayer, toggleSingleLayer } from '../../store/slices/layers';
import SelectAOIDialog from '../aoi/SelectAOIDialog';
import { getIconForLayer } from '../../utils/icons';
import { isLayersTab, isFiremetricsTab } from '../../constants/maps';

const LayersTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.ui.sections);
  const { categories } = useAppSelector(state => state.layers);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const [showDialog, setShowDialog] = useState(false);

  // Handle click on the layer text/name - exclusive behavior
  const handleLayerClick = (categoryId: string, layerId: number, isBasemap: boolean = false) => {
    if (isBasemap) {
      // Basemaps are always exclusive
      dispatch(toggleLayer({ categoryId, layerId }));
      return;
    }

    // For non-basemap layers, check if an AOI is selected for GeoTIFF layers
    if (isFiremetricsTab(categoryId) && !currentAOI) {
      setShowDialog(true);
      return;
    }

    // Get the current layer to check if it's already active
    const category = categories[categoryId];
    if (!category) return;
    
    const layer = category.layers.find(l => l.id === layerId);
    
    // If the layer is already active and it's the only active one in its category, do nothing
    // This prevents the flashing effect when clicking on an already active layer
    if (layer && layer.active) {
      const activeLayersInCategory = category.layers.filter(l => l.active).length;
      
      if (activeLayersInCategory === 1) {
        // This is the only active layer in this category, so don't toggle it off
        return;
      }
    }
    
    // Use toggleSingleLayer to make it exclusive (turn off other layers in the same category)
    dispatch(toggleSingleLayer({ categoryId, layerId }));
  };

  // Handle click on the eye icon - non-exclusive behavior
  const handleEyeClick = (e: React.MouseEvent, categoryId: string, layerId: number) => {
    e.stopPropagation(); // Prevent the parent onClick from firing
    
    // For GeoTIFF layers, check if an AOI is selected
    if (isFiremetricsTab(categoryId) && !currentAOI) {
      setShowDialog(true);
      return;
    }
    
    // Use toggleLayer to make it non-exclusive (keep other layers on)
    dispatch(toggleLayer({ categoryId, layerId }));
  };

  // Helper function to render a layer item with consistent styling
  const renderLayerItem = (layer: any, categoryId: string, isBasemap: boolean = false) => {
    const Icon = getIconForLayer(categoryId, layer.name);
    return (
      <div
        key={`${categoryId}-${layer.id}`}
        onClick={() => handleLayerClick(categoryId, layer.id, isBasemap)}
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
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto">
        {/* Basemaps Section */}
        <div>
          <SectionHeader 
            title="BASEMAPS" 
            isOpen={sections.basemaps} 
            onToggle={() => dispatch(toggleSection('basemaps'))}
          />
          {sections.basemaps && categories.basemaps && (
            <div className="space-y-1">
              {categories.basemaps.layers.map(layer => renderLayerItem(layer, 'basemaps', true))}
            </div>
          )}
        </div>

        {/* Jurisdictions Section */}
        <div>
          <SectionHeader 
            title="JURISDICTIONS" 
            isOpen={sections.jurisdictions} 
            onToggle={() => dispatch(toggleSection('jurisdictions'))}
          />
          {sections.jurisdictions && categories.jurisdictions && (
            <div className="space-y-1">
              {categories.jurisdictions.layers.map(layer => renderLayerItem(layer, 'jurisdictions'))}
            </div>
          )}
        </div>

        {/* Wildfire Section */}
        <div>
          <SectionHeader 
            title="WILDFIRE" 
            isOpen={sections.wildfire} 
            onToggle={() => dispatch(toggleSection('wildfire'))}
          />
          {sections.wildfire && categories.wildfire && (
            <div className="space-y-1">
              {categories.wildfire.layers.map(layer => renderLayerItem(layer, 'wildfire'))}
            </div>
          )}
        </div>

        {/* Elevation Section */}
        <div>
          <SectionHeader 
            title="ELEVATION" 
            isOpen={sections.elevation} 
            onToggle={() => dispatch(toggleSection('elevation'))}
          />
          {sections.elevation && categories.elevation && (
            <div className="space-y-1">
              {categories.elevation.layers.map(layer => renderLayerItem(layer, 'elevation'))}
            </div>
          )}
        </div>

        {/* Landscape Section */}
        <div>
          <SectionHeader 
            title="LANDSCAPE" 
            isOpen={sections.landscape} 
            onToggle={() => dispatch(toggleSection('landscape'))}
          />
          {sections.landscape && categories.landscape && (
            <div className="space-y-1">
              {categories.landscape.layers.map(layer => renderLayerItem(layer, 'landscape'))}
            </div>
          )}
        </div>

        {/* Transportation Section */}
        <div>
          <SectionHeader 
            title="TRANSPORTATION" 
            isOpen={sections.transportation} 
            onToggle={() => dispatch(toggleSection('transportation'))}
          />
          {sections.transportation && categories.transportation && (
            <div className="space-y-1">
              {categories.transportation.layers.map(layer => renderLayerItem(layer, 'transportation'))}
            </div>
          )}
        </div>

        {/* Water Section */}
        <div>
          <SectionHeader 
            title="WATER" 
            isOpen={sections.water} 
            onToggle={() => dispatch(toggleSection('water'))}
          />
          {sections.water && categories.water && (
            <div className="space-y-1">
              {categories.water.layers.map(layer => renderLayerItem(layer, 'water'))}
            </div>
          )}
        </div>

        {/* Infrastructure Section */}
        <div>
          <SectionHeader 
            title="INFRASTRUCTURE" 
            isOpen={sections.infrastructure} 
            onToggle={() => dispatch(toggleSection('infrastructure'))}
          />
          {sections.infrastructure && categories.infrastructure && (
            <div className="space-y-1">
              {categories.infrastructure.layers.map(layer => renderLayerItem(layer, 'infrastructure'))}
            </div>
          )}
        </div>

        {/* Restoration Class Section */}
        <div>
          <SectionHeader 
            title="RESTORATION CLASS" 
            isOpen={sections.restorationClass} 
            onToggle={() => dispatch(toggleSection('restorationClass'))}
          />
          {sections.restorationClass && categories.restorationClass && (
            <div className="space-y-1">
              {categories.restorationClass.layers.map(layer => renderLayerItem(layer, 'restorationClass'))}
            </div>
          )}
        </div>

        {/* Habitat Section */}
        <div>
          <SectionHeader 
            title="HABITAT" 
            isOpen={sections.habitat} 
            onToggle={() => dispatch(toggleSection('habitat'))}
          />
          {sections.habitat && categories.habitat && (
            <div className="space-y-1">
              {categories.habitat.layers.map(layer => renderLayerItem(layer, 'habitat'))}
            </div>
          )}
        </div>
      </div>

      {/* Add Layer Button */}
      <div className="mt-4 flex justify-center">
        <button 
          className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs"
          onClick={() => {
            // TODO: Implement layer addition functionality
            console.log('Add layer clicked');
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Layer</span>
        </button>
      </div>

      {/* SelectAOI Dialog */}
      {showDialog && (
        <SelectAOIDialog onClose={() => setShowDialog(false)} />
      )}
    </div>
  );
};

export default LayersTab;