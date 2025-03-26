import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { store } from '../../store';
import { ELEVATION_SERVICE } from '../../services/maps/services';
import { geotiffService } from '../../services/geotiffService';
import { getGeoTiffUrl } from '../../constants/urls';
import LayerMenu from './LayerMenu';
import LegendContent from './LegendContent';
import LegendDialogs from './LegendDialogs';

interface MenuState {
  isOpen: boolean;
  categoryId: string;
  layerId: number;
}

const Legend: React.FC = () => {
  const dispatch = store.dispatch;
  const { categories } = useAppSelector(state => state.layers);
  const currentAOI = useAppSelector(state => state.home.aoi.current);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [showAboutPanel, setShowAboutPanel] = useState<{
    metadata: any;
    range: any;
    layerName: string;
    categoryId: string;
  } | null>(null);
  const [showFeatureAboutPanel, setShowFeatureAboutPanel] = useState<{
    metadata: any;
    layerName: string;
  } | null>(null);
  const [showArcGISAboutPanel, setShowArcGISAboutPanel] = useState<{
    metadata: any;
    layerName: string;
    renderingRule: string;
  } | null>(null);
  const [showTiffAboutPanel, setShowTiffAboutPanel] = useState<{
    metadata: any;
    range: any;
    layerName: string;
    renderingRule?: string;
  } | null>(null);

  const handleMenuClick = (e: React.MouseEvent, categoryId: string, layerId: number) => {
    e.stopPropagation();
    if (menu?.categoryId === categoryId && menu?.layerId === layerId) {
      setMenu(null);
    } else {
      setMenu({ isOpen: true, categoryId, layerId });
    }
  };

  const handleClickOutside = () => {
    setMenu(null);
  };

  useEffect(() => {
    if (menu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menu]);

  const handleShowAbout = async (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer || !currentAOI) return;

    try {
      const aoiId = 'id' in currentAOI ? currentAOI.id : 1;
      const layerName = layer.source.split('/').pop()?.replace('.tif', '') || '';
      const url = getGeoTiffUrl(aoiId, layerName);

      const metadata = await geotiffService.getGeoTiffMetadata(url);
      
      setShowAboutPanel({
        metadata: metadata.metadata,
        range: metadata.range,
        layerName: layer.name,
        categoryId
      });
      setMenu(null);
    } catch (error) {
      console.error('Failed to load GeoTIFF metadata:', error);
    }
  };

  const handleShowFeatureAbout = async (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer || !layer.source) return;

    try {
      const response = await fetch(`${layer.source}?f=json`);
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      const metadata = await response.json();
      
      setShowFeatureAboutPanel({
        metadata,
        layerName: layer.name
      });
      setMenu(null);
    } catch (error) {
      console.error('Failed to load feature service metadata:', error);
    }
  };

  const handleShowArcGISAbout = async (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer) return;

    try {
      // Get the service metadata which includes statistics
      const response = await fetch(`${ELEVATION_SERVICE.serviceUrl}?f=json`);
      if (!response.ok) {
        throw new Error('Failed to fetch service metadata');
      }

      const metadata = await response.json();
      
      setShowArcGISAboutPanel({
        metadata,
        layerName: layer.name,
        renderingRule: layer.renderingRule || ''
      });
      setMenu(null);
    } catch (error) {
      console.error('Failed to load ArcGIS service metadata:', error);
    }
  };

  const handleShowTiffAbout = async (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer) return;

    try {
      // Use the layer's metadata and range that's already in Redux
      if (layer.metadata && layer.range) {
        setShowTiffAboutPanel({
          metadata: layer.metadata,
          range: layer.range,
          layerName: layer.name,
          renderingRule: layer.renderingRule
        });
        setMenu(null);
      }
    } catch (error) {
      console.error('Failed to load TIFF metadata:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <LegendContent
        onShowAbout={handleShowAbout}
        onShowFeatureAbout={handleShowFeatureAbout}
        onShowArcGISAbout={handleShowArcGISAbout}
        onShowTiffAbout={handleShowTiffAbout}
        onMenuClick={handleMenuClick}
        menu={menu}
      />

      <LegendDialogs
        showAboutPanel={showAboutPanel}
        showFeatureAboutPanel={showFeatureAboutPanel}
        showArcGISAboutPanel={showArcGISAboutPanel}
        showTiffAboutPanel={showTiffAboutPanel}
        onCloseAbout={() => setShowAboutPanel(null)}
        onCloseFeatureAbout={() => setShowFeatureAboutPanel(null)}
        onCloseArcGISAbout={() => setShowArcGISAboutPanel(null)}
        onCloseTiffAbout={() => setShowTiffAboutPanel(null)}
      />
    </div>
  );
};

export default Legend;