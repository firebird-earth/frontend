import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { store } from '../../store';
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
  const [showFeatureAboutPanel, setShowFeatureAboutPanel] = useState<{
    metadata: any;
    layerName: string;
  } | null>(null);
  const [showGeoTiffAboutPanel, setShowGeoTiffAboutPanel] = useState<{
    layerName: string;
    layerId: number;
    categoryId: string;
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

  const handleShowGeoTiffAbout = (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer) return;

    setShowGeoTiffAboutPanel({
      layerName: layer.name,
      layerId,
      categoryId
    });
    setMenu(null);
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

  const handleShowTiffAbout = (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer || !layer.metadata || !layer.range) return;

    setShowTiffAboutPanel({
      metadata: layer.metadata,
      range: layer.range,
      layerName: layer.name,
      renderingRule: layer.renderingRule
    });
    setMenu(null);
  };

  return (
    <div className="h-full flex flex-col">
      <LegendContent
        onShowFeatureAbout={handleShowFeatureAbout}
        onShowAbout={handleShowGeoTiffAbout}
        onShowTiffAbout={handleShowTiffAbout}
        onMenuClick={handleMenuClick}
        menu={menu}
      />

      <LegendDialogs
        showGeoTiffAboutPanel={showGeoTiffAboutPanel}
        showTiffAboutPanel={showTiffAboutPanel}
        showFeatureAboutPanel={showFeatureAboutPanel}
        onCloseGeoTiffAbout={() => setShowGeoTiffAboutPanel(null)}
        onCloseFeatureAbout={() => setShowFeatureAboutPanel(null)}
        onCloseTiffAbout={() => setShowTiffAboutPanel(null)}
      />
    </div>
  );
};

export default Legend;