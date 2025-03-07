export function validateGeoTiff(arrayBuffer: ArrayBuffer): void {
  console.log('Validating GeoTIFF structure...');
  
  if (arrayBuffer.byteLength < 8) {
    throw new Error('File too small to be a valid TIFF');
  }

  const dataView = new DataView(arrayBuffer);
  const byteOrder = dataView.getUint16(0, true);
  const isLittleEndian = byteOrder === 0x4949;
  const isBigEndian = byteOrder === 0x4D4D;
  
  console.log('Byte order:', isLittleEndian ? 'Little Endian (II)' : isBigEndian ? 'Big Endian (MM)' : 'Invalid');
  
  if (!isLittleEndian && !isBigEndian) {
    throw new Error(`Invalid byte order marker: 0x${byteOrder.toString(16)}`);
  }

  const magicNumber = dataView.getUint16(2, isLittleEndian);
  console.log('Magic number:', magicNumber);
  
  if (magicNumber !== 42 && magicNumber !== 43) {
    throw new Error(`Invalid TIFF magic number: ${magicNumber}`);
  }

  console.log('GeoTIFF validation successful');
}