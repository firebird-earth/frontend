import React from 'react';
import { Info } from 'lucide-react';
import { useDraggable } from '../../hooks/useDraggable';

interface AboutFeatureDialogProps {
  metadata: {
    name: string;
    description: string;
    copyrightText?: string;
    defaultSymbol?: any;
    drawingInfo?: any;
    geometryType: string;
    sourceDescription?: string;
    fields: Array<{
      name: string;
      type: string;
      alias: string;
    }>;
  };
  onClose: () => void;
  layerName?: string;
}

const AboutFeatureDialog: React.FC<AboutFeatureDialogProps> = ({ metadata, onClose, layerName }) => {
  const { position, handleMouseDown, handleDialogClick, dialogRef } = useDraggable({
    padding: 25,
    initialCorner: 'bottom-right'
  });

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
            About
          </h3>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Layer Name */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Layer Name</h4>
            <p className="text-sm text-gray-600 break-words">{metadata.name || layerName || ''}</p>
          </div>

          {/* Description */}
          {metadata.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <div 
                className="text-sm text-gray-600 break-words [&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline [&_div]:!font-normal [&_span]:!font-normal [&_br]:mb-4 [&_div]:mb-4 last:[&_div]:mb-0"
                dangerouslySetInnerHTML={{ __html: metadata.description }}
              />
            </div>
          )}

          {/* Source Description */}
          {metadata.sourceDescription && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Source</h4>
              <div 
                className="text-sm text-gray-600 break-words [&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline [&_div]:!font-normal [&_span]:!font-normal [&_br]:mb-4 [&_div]:mb-4 last:[&_div]:mb-0"
                dangerouslySetInnerHTML={{ __html: metadata.sourceDescription }}
              />
            </div>
          )}

          {/* Geometry Type */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Geometry Type</h4>
            <p className="text-sm text-gray-600 break-words">{metadata.geometryType}</p>
          </div>

          {/* Fields */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Fields</h4>
            <div className="space-y-1.5">
              {metadata.fields.map((field, index) => (
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
        </div>
        
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            {metadata.copyrightText ? (
              <div 
                className="text-xs text-gray-500 italic flex-1 mr-4 break-words [&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline [&_div]:!font-normal [&_span]:!font-normal [&_br]:mb-4 [&_div]:mb-4 last:[&_div]:mb-0"
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