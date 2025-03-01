declare module 'geotiff' {
  export function fromArrayBuffer(buffer: ArrayBuffer): Promise<GeoTIFF>;
  
  export interface GeoTIFF {
    getImage(index?: number): Promise<GeoTIFFImage>;
  }

  export interface GeoTIFFImage {
    getWidth(): number;
    getHeight(): number;
    readRasters(options?: any): Promise<any[]>;
    getBoundingBox(): [number, number, number, number];
    fileDirectory: {
      [key: string]: any;
      SamplesPerPixel: number;
      BitsPerSample: number[];
      Compression: number;
      PhotometricInterpretation: number;
      Orientation: number;
      XResolution: number;
      YResolution: number;
      ResolutionUnit: number;
      ModelTiepointTag?: number[];
      ModelPixelScaleTag?: number[];
      GDAL_NODATA?: string | number;
      GDAL_METADATA?: string;
    };
    geoKeys?: {
      GeographicTypeGeoKey?: string;
      [key: string]: any;
    };
  }
}