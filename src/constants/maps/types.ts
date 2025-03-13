export interface LayerMetadata {
  name: string;
  description: string;
  units: string;
  colorScheme: string;
  source?: string; // Optional source attribution
}

// Helper function to validate layer metadata
export function validateLayerMetadata(metadata: LayerMetadata): boolean {
  return (
    typeof metadata.name === 'string' &&
    typeof metadata.description === 'string' &&
    typeof metadata.units === 'string' &&
    typeof metadata.colorScheme === 'string' &&
    (metadata.source === undefined || typeof metadata.source === 'string')
  );
}