import { validateGeoTiff } from './validateGeoTiff';

// Debug configuration
const LoadersConfig = {
  debug: false
} as const;

export function setLoadersDebug(enabled: boolean) {
  (LoadersConfig as any).debug = enabled;
}

export async function loadGeoTiffFromUrl(url: string, onProgress?: (progress: number) => void): Promise<ArrayBuffer> {
  try {
    if (LoadersConfig.debug) {
      console.log('Loading GeoTIFF from URL:', url);
    }
    
    const fetchOptions: RequestInit = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'image/tiff,*/*'
      }
    };

    const headResponse = await fetch(url, { ...fetchOptions, method: 'HEAD' });
    if (!headResponse.ok) {
      throw new Error(`Failed to fetch file info: ${headResponse.status} ${headResponse.statusText}`);
    }
    
    const totalSize = parseInt(headResponse.headers.get('content-length') || '0', 10);
    if (totalSize === 0) {
      throw new Error('File size is 0 bytes');
    }

    if (LoadersConfig.debug) {
      console.log('GeoTIFF file size:', totalSize, 'bytes');
      console.log('Content-Type:', headResponse.headers.get('content-type'));
    }

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (onProgress) {
        onProgress(Math.round((receivedLength / totalSize) * 100));
      }

      if (LoadersConfig.debug) {
        console.log('Download progress:', Math.round((receivedLength / totalSize) * 100), '%');
      }
    }

    if (LoadersConfig.debug) {
      console.log('GeoTIFF download complete:', receivedLength, 'bytes received');
    }

    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    return chunksAll.buffer;
  } catch (error) {
    console.error('Failed to load GeoTIFF:', error);
    throw error;
  }
}