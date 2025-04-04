import React, { useState, useEffect } from 'react';
import { Info, Loader2, AlertTriangle } from 'lucide-react';
import { useDraggable } from '../../hooks/useDraggable';

interface AboutFeatureDialogProps {
  url: string;
  onClose: () => void;
  layerName?: string;
}

const AboutFeatureDialog: React.FC<AboutFeatureDialogProps> = ({ 
  url,
  onClose,
  layerName
}) => {
  const titleBarRef = document.querySelector('.bg-white.dark\\:bg-gray-800.shadow-md') as HTMLElement;

  const { position, handleMouseDown, handleDialogClick, dialogRef } = useDraggable({
    padding: 8,
    referenceElement: titleBarRef
  });

  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceItemId, setServiceItemId] = useState<string | null>(null);

  const sanitizeDescription = (html: string | null | undefined): string => {
    if (!html) return '';

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Extract and preserve links
    const links: string[] = [];
    temp.querySelectorAll('a').forEach(a => {
      links.push(a.outerHTML);
    });

    // Get text content (strips all HTML)
    let text = temp.textContent || '';

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Reinsert preserved links
    links.forEach(link => {
      const placeholder = link.match(/>(.*?)</)?.[1] || '';
      text = text.replace(placeholder, link);
    });

    return text;
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // First fetch layer metadata
        const layerResponse = await fetch(`${url}?f=json`);
        if (!layerResponse.ok) {
          throw new Error('Failed to fetch layer metadata');
        }
        const layerData = await layerResponse.json();
        
        // Get service URL by removing layer number
        const serviceUrl = url.replace(/\/\d+$/, '');
        const serviceResponse = await fetch(`${serviceUrl}?f=json`);
        if (!serviceResponse.ok) {
          throw new Error('Failed to fetch service metadata');
        }
        const serviceData = await serviceResponse.json();
        
        // Extract service item ID if available
        if (serviceData.serviceItemId) {
          setServiceItemId(serviceData.serviceItemId);
        }

        // Create sanitized metadata object
        const sanitizedMetadata = {
          ...layerData,
          name: layerData.name,
          description: sanitizeDescription(layerData.description || serviceData.description || serviceData.serviceDescription),
          sourceDescription: sanitizeDescription(layerData.sourceDescription),
          copyrightText: sanitizeDescription(layerData.copyrightText),
          fields: layerData.fields || []
        };

        console.log('Feature service metadata response:', {
          url,
          data: sanitizedMetadata,
          serviceItemId: serviceData.serviceItemId
        });
        
        setMetadata(sanitizedMetadata);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load metadata');
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  // Get the service URL by removing any layer number at the end
  const serviceUrl = url.replace(/\/\d+$/, '');
  
  // Create ArcGIS Online item URL if we have a service item ID
  const arcgisOnlineUrl = serviceItemId 
    ? `https://www.arcgis.com/home/item.html?id=${serviceItemId}`
    : null;

  return (
    <div className="fixed inset-0 z-[2000]" style={{ pointerEvents: 'none' }}>
      <div 
        ref={dialogRef}
        onClick={handleDialogClick}
        className="bg-white rounded-lg shadow-xl w-[480px] absolute max-h-[80vh] flex flex-col"
        style={{ 
          left: position.x,
          top: position.y,
          transition: 'none',
          pointerEvents: 'auto'
        }}
      >
        <div 
          className="p-4 border-b border-gray-200 drag-handle flex items-center space-x-2 cursor-move select-none flex-shrink-0"
          onMouseDown={handleMouseDown}
        >
          <Info className="h-5 w-5 text-gray-500 pointer-events-none" />
          <h3 className="text-lg font-medium text-gray-900 pointer-events-none">
            {layerName || metadata?.name || 'Layer Information'}
          </h3>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-2 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {metadata && !loading && !error && (
            <>
              {/* Layer Name with Link */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Layer Name</h4>
                <a 
                  href={arcgisOnlineUrl || `${serviceUrl}?f=html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-words"
                >
                  {metadata.name || layerName || ''}
                </a>
              </div>

              {/* Description */}
              {metadata.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <div 
                    className="text-sm text-gray-600 whitespace-pre-line [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: metadata.description }}
                  />
                </div>
              )}

              {/* Source Description */}
              {metadata.sourceDescription && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Source</h4>
                  <div 
                    className="text-sm text-gray-600 whitespace-pre-line [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: metadata.sourceDescription }}
                  />
                </div>
              )}

              {/* Fields */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Fields</h4>
                <div className="space-y-1.5">
                  {metadata.fields.map((field: any, index: number) => (
                    <div key={index} className="text-sm flex items-start space-x-2 min-w-0">
                      <span className="font-mono text-blue-600 flex-shrink-0">{field.name}</span>
                      <span className="text-gray-400 flex-shrink-0">|</span>
                      <span className="text-gray-600 flex-shrink-0">{field.type}</span>
                      {field.alias && field.alias !== field.name && (
                        <>
                          <span className="text-gray-400 flex-shrink-0">|</span>
                          <span className="text-gray-600 italic truncate flex-1">
                            {field.alias}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            {metadata?.copyrightText ? (
              <div 
                className="text-xs text-gray-500 italic flex-1 mr-4 [&_a]:text-blue-600 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: metadata.copyrightText }}
              />
            ) : (
              <div className="flex-1" />
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutFeatureDialog;