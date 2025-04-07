import React, { useState, useTransition } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import LegendContent from './LegendContent';
import LegendDialogs from './LegendDialogs';

interface MenuState {
  isOpen: boolean;
  categoryId: string;
  layerId: number;
}

const Legend: React.FC = () => {
  const { categories } = useAppSelector(state => state.layers);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [showFeatureAboutPanel, setShowFeatureAboutPanel] = useState<{
    url: string;
    layerName: string;
  } | null>(null);
  const [showGeoTiffAboutPanel, setShowGeoTiffAboutPanel] = useState<{
    layerName: string;
    layerId: number;
    categoryId: string;
  } | null>(null);

  // Add useTransition hook
  const [isPending, startTransition] = useTransition();

  const handleMenuClick = (e: React.MouseEvent, categoryId: string, layerId: number) => {
    e.stopPropagation();
    startTransition(() => {
      if (menu?.categoryId === categoryId && menu?.layerId === layerId) {
        setMenu(null);
      } else {
        setMenu({ isOpen: true, categoryId, layerId });
      }
    });
  };

  const handleClickOutside = () => {
    startTransition(() => {
      setMenu(null);
    });
  };

  React.useEffect(() => {
    if (menu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menu]);

  const handleShowGeoTiffAbout = (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer) return;

    startTransition(() => {
      setShowGeoTiffAboutPanel({
        layerName: layer.name,
        layerId,
        categoryId
      });
      setMenu(null);
    });
  };

  const handleShowFeatureAbout = (categoryId: string, layerId: number) => {
    const layer = categories[categoryId]?.layers.find(l => l.id === layerId);
    if (!layer || !layer.source) return;

    startTransition(() => {
      setShowFeatureAboutPanel({
        url: layer.source,
        layerName: layer.name
      });
      setMenu(null);
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div style={{ pointerEvents: isPending ? 'none' : 'auto' }}>
        <LegendContent
          onShowFeatureAbout={handleShowFeatureAbout}
          onShowAbout={handleShowGeoTiffAbout}
          onMenuClick={handleMenuClick}
          menu={menu}
        />
      </div>

      <LegendDialogs
        showFeatureAboutPanel={showFeatureAboutPanel}
        showGeoTiffAboutPanel={showGeoTiffAboutPanel}
        onCloseFeatureAbout={() => setShowFeatureAboutPanel(null)}
        onCloseGeoTiffAbout={() => setShowGeoTiffAboutPanel(null)}
      />
    </div>
  );
};

export default Legend;
