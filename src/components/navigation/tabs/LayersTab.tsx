import React from 'react';
import { MapIcon, LandPlot, Mountain, AtSign as RoadSign, Waves, Droplets, Factory, Leaf, Bird, Shield, Workflow, Flame, Plus, Building } from 'lucide-react';
import SectionHeader from '../SectionHeader';
import LayerItem from '../LayerItem';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { toggleSection } from '../../../store/slices/uiSlice';
import { toggleLayer, toggleSingleLayer } from '../../../store/slices/layersSlice';

const LayersTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.ui.sections);
  const { categories } = useAppSelector(state => state.layers);

  const handleLayerClick = (categoryId: string, layerId: number, isBasemap: boolean = false) => {
    if (isBasemap) {
      dispatch(toggleLayer({ categoryId, layerId }));
    } else {
      // Use toggleLayer instead of toggleSingleLayer to allow multiple layers to be active
      dispatch(toggleLayer({ categoryId, layerId }));
    }
  };

  const handleEyeClick = (e: React.MouseEvent, categoryId: string, layerId: number) => {
    e.stopPropagation();
    dispatch(toggleLayer({ categoryId, layerId }));
  };

  const getIconForLayer = (categoryId: string, layerName: string) => {
    switch (categoryId) {
      case 'basemaps':
        return MapIcon;
      case 'wildfire':
        return Flame;
      case 'landscape':
        return Mountain;
      case 'jurisdictions':
        return LandPlot;
      case 'transportation':
        return RoadSign;
      case 'water':
        return layerName.includes('Watersheds') ? Waves : Droplets;
      case 'infrastructure':
        return layerName.includes('Building') ? Building : Factory;
      case 'restorationClass':
        return Leaf;
      case 'habitat':
        return layerName.includes('Deer') ? Shield :
               layerName.includes('Grouse') ? Bird :
               layerName.includes('Migration') ? Workflow : Shield;
      default:
        return MapIcon;
    }
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
              {categories.basemaps.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={MapIcon}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('basemaps', layer.id, true)}
                  onEyeClick={(e) => handleEyeClick(e, 'basemaps', layer.id)}
                  isBasemap={true}
                />
              ))}
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
              {categories.wildfire.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={Flame}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('wildfire', layer.id)}
                  onEyeClick={(e) => handleEyeClick(e, 'wildfire', layer.id)}
                />
              ))}
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
              {categories.landscape.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={Mountain}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('landscape', layer.id)}
                  onEyeClick={(e) => handleEyeClick(e, 'landscape', layer.id)}
                />
              ))}
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
              {categories.jurisdictions.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={LandPlot}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('jurisdictions', layer.id)}
                  onEyeClick={(e) => handleEyeClick(e, 'jurisdictions', layer.id)}
                />
              ))}
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
              {categories.transportation.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={RoadSign}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('transportation', layer.id)}
                  onEyeClick={(e) => handleEyeClick(e, 'transportation', layer.id)}
                />
              ))}
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
              {categories.water.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={layer.name.includes('Watersheds') ? Waves : Droplets}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('water', layer.id)}
                  onEyeClick={(e) => handleEyeClick(e, 'water', layer.id)}
                />
              ))}
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
              {categories.infrastructure.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={layer.name === 'Buildings' ? Building : Factory}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('infrastructure', layer.id)}
                  onEyeClick={(e) => handleEyeClick(e, 'infrastructure', layer.id)}
                />
              ))}
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
              {categories.restorationClass.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={Leaf}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('restorationClass', layer.id)}
                  onEyeClick={(e) => handleEyeClick(e, 'restorationClass', layer.id)}
                />
              ))}
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
              {categories.habitat.layers.map(layer => (
                <LayerItem
                  key={layer.id}
                  icon={getIconForLayer('habitat', layer.name)}
                  name={layer.name}
                  active={layer.active}
                  onClick={() => handleLayerClick('habitat', layer.id)}
                  onEyeClick={(e) => handleEyeClick(e, 'habitat', layer.id)}
                />
              ))}
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
    </div>
  );
};

export default LayersTab;