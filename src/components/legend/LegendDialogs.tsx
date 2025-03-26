import React from 'react';
import AboutGeoTiffDialog from './AboutGeoTiffDialog';
import AboutFeatureDialog from './AboutFeatureDialog';
import AboutArcGISDialog from './AboutArcGISDialog';
import AboutTiffDialog from './AboutTiffDialog';

interface LegendDialogsProps {
  showAboutPanel: {
    metadata: any;
    range: any;
    layerName: string;
    categoryId: string;
  } | null;
  showFeatureAboutPanel: {
    metadata: any;
    layerName: string;
  } | null;
  showArcGISAboutPanel: {
    metadata: any;
    layerName: string;
    renderingRule: string;
  } | null;
  showTiffAboutPanel: {
    metadata: any;
    range: any;
    layerName: string;
    renderingRule?: string;
  } | null;
  onCloseAbout: () => void;
  onCloseFeatureAbout: () => void;
  onCloseArcGISAbout: () => void;
  onCloseTiffAbout: () => void;
}

const LegendDialogs: React.FC<LegendDialogsProps> = ({
  showAboutPanel,
  showFeatureAboutPanel,
  showArcGISAboutPanel,
  showTiffAboutPanel,
  onCloseAbout,
  onCloseFeatureAbout,
  onCloseArcGISAbout,
  onCloseTiffAbout
}) => {
  return (
    <>
      {showAboutPanel && (
        <AboutGeoTiffDialog
          metadata={showAboutPanel.metadata}
          range={showAboutPanel.range}
          layerName={showAboutPanel.layerName}
          categoryId={showAboutPanel.categoryId}
          onClose={onCloseAbout}
        />
      )}

      {showFeatureAboutPanel && (
        <AboutFeatureDialog
          metadata={showFeatureAboutPanel.metadata}
          layerName={showFeatureAboutPanel.layerName}
          onClose={onCloseFeatureAbout}
        />
      )}

      {showArcGISAboutPanel && (
        <AboutArcGISDialog
          metadata={showArcGISAboutPanel.metadata}
          layerName={showArcGISAboutPanel.layerName}
          renderingRule={showArcGISAboutPanel.renderingRule}
          onClose={onCloseArcGISAbout}
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