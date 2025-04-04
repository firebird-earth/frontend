import React from 'react';
import AboutFeatureDialog from './AboutFeatureDialog';
import AboutTiffDialog from './AboutTiffDialog';

interface LegendDialogsProps {
  showFeatureAboutPanel: {
    url: string;
    layerName: string;
  } | null;
  showGeoTiffAboutPanel: {
    layerName: string;
    layerId: number;
    categoryId: string;
  } | null;
  onCloseFeatureAbout: () => void;
  onCloseGeoTiffAbout: () => void;
}

const LegendDialogs: React.FC<LegendDialogsProps> = ({
  showFeatureAboutPanel,
  showGeoTiffAboutPanel,
  onCloseFeatureAbout,
  onCloseGeoTiffAbout
}) => {
  return (
    <>
      {showFeatureAboutPanel && (
        <AboutFeatureDialog
          url={showFeatureAboutPanel.url}
          layerName={showFeatureAboutPanel.layerName}
          onClose={onCloseFeatureAbout}
        />
      )}

      {showGeoTiffAboutPanel && (
        <AboutTiffDialog
          layerName={showGeoTiffAboutPanel.layerName}
          layerId={showGeoTiffAboutPanel.layerId}
          categoryId={showGeoTiffAboutPanel.categoryId}
          onClose={onCloseGeoTiffAbout}
        />
      )}
    </>
  );
};

export default LegendDialogs;