import React from 'react';
import AboutFeatureDialog from './AboutFeatureDialog';
import AboutGeoTiffDialog from './AboutGeoTiffDialog';
import AboutTiffDialog from './AboutTiffDialog';

interface LegendDialogsProps {
  showFeatureAboutPanel: {
    metadata: any;
    layerName: string;
  } | null;
  showGeoTiffAboutPanel: {
    layerName: string;
    layerId: number;
    categoryId: string;
  } | null;
  showTiffAboutPanel: {
    metadata: any;
    range: any;
    layerName: string;
    renderingRule?: string;
  } | null;
  onCloseFeatureAbout: () => void;
  onCloseGeoTiffAbout: () => void;
  onCloseTiffAbout: () => void;
}

const LegendDialogs: React.FC<LegendDialogsProps> = ({
  showFeatureAboutPanel,
  showGeoTiffAboutPanel,
  showTiffAboutPanel,
  onCloseFeatureAbout,
  onCloseGeoTiffAbout,
  onCloseTiffAbout
}) => {
  return (
    <>
      {showFeatureAboutPanel && (
        <AboutFeatureDialog
          metadata={showFeatureAboutPanel.metadata}
          layerName={showFeatureAboutPanel.layerName}
          onClose={onCloseFeatureAbout}
        />
      )}

      {showGeoTiffAboutPanel && (
        <AboutGeoTiffDialog
          layerName={showGeoTiffAboutPanel.layerName}
          layerId={showGeoTiffAboutPanel.layerId}
          categoryId={showGeoTiffAboutPanel.categoryId}
          onClose={onCloseGeoTiffAbout}
        />
      )}

      {showTiffAboutPanel && (
        <AboutTiffDialog
          metadata={showTiffAboutPanel.metadata}
          range={showTiffAboutPanel.range}
          layerName={showTiffAboutPanel.layerName}
          renderingRule={showTiffAboutPanel.renderingRule}
          onClose={onCloseTiffAbout}
        />
      )}
    </>
  );
};

export default LegendDialogs;