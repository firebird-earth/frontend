export function validateGeoTiff(arrayBuffer: ArrayBuffer): void {
  console.log('Validating TIFF structure...');
  
  // Check if buffer exists and has content
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error('Empty or invalid array buffer');
  }

  // Check minimum size for TIFF header (8 bytes)
  if (arrayBuffer.byteLength < 8) {
    throw new Error(`File too small to be a valid TIFF (${arrayBuffer.byteLength} bytes)`);
  }

  try {
    const dataView = new DataView(arrayBuffer);
    
    // Check byte order marker (II for little-endian or MM for big-endian)
    const byteOrder = dataView.getUint16(0, true);
    const isLittleEndian = byteOrder === 0x4949; // 'II'
    const isBigEndian = byteOrder === 0x4D4D;    // 'MM'
    
    console.log('Byte order:', isLittleEndian ? 'Little Endian (II)' : isBigEndian ? 'Big Endian (MM)' : 'Invalid');
    
    if (!isLittleEndian && !isBigEndian) {
      throw new Error(`Invalid byte order marker: 0x${byteOrder.toString(16)}`);
    }

    // Check magic number (42 for classic TIFF, 43 for BigTIFF)
    const magicNumber = dataView.getUint16(2, isLittleEndian);
    console.log('Magic number:', magicNumber);
    
    if (magicNumber !== 42 && magicNumber !== 43) {
      throw new Error(`Invalid TIFF magic number: ${magicNumber}`);
    }

    // Check IFD offset (must be >= 8 and within file bounds)
    const ifdOffset = dataView.getUint32(4, isLittleEndian);
    if (ifdOffset < 8 || ifdOffset >= arrayBuffer.byteLength) {
      throw new Error(`Invalid IFD offset: ${ifdOffset}`);
    }

    // Try to read the first IFD entry count
    try {
      const entryCount = dataView.getUint16(ifdOffset, isLittleEndian);
      console.log('IFD entry count:', entryCount);
      
      // Validate that we can read all entries (each entry is 12 bytes)
      const entriesEnd = ifdOffset + 2 + (entryCount * 12);
      if (entriesEnd > arrayBuffer.byteLength) {
        throw new Error(`IFD entries extend beyond buffer (${entriesEnd} > ${arrayBuffer.byteLength})`);
      }

      // Validate minimum and maximum entry count
      if (entryCount === 0) {
        throw new Error('TIFF contains no entries');
      }
      if (entryCount > 65535) {
        throw new Error(`Too many IFD entries: ${entryCount}`);
      }

      // Try to read first entry to validate structure
      const firstEntryOffset = ifdOffset + 2;
      const tag = dataView.getUint16(firstEntryOffset, isLittleEndian);
      const type = dataView.getUint16(firstEntryOffset + 2, isLittleEndian);
      const count = dataView.getUint32(firstEntryOffset + 4, isLittleEndian);

      // Validate entry type (1-13 are valid TIFF types)
      if (type < 1 || type > 13) {
        throw new Error(`Invalid TIFF entry type: ${type}`);
      }

      console.log('First IFD entry:', { tag, type, count });
    } catch (e) {
      throw new Error(`Failed to read IFD entries: ${e.message}`);
    }

    // Check for required TIFF tags
    const requiredTags = new Set([
      256, // ImageWidth
      257, // ImageLength
      258, // BitsPerSample
      259, // Compression
      262, // PhotometricInterpretation
      273, // StripOffsets
      278, // RowsPerStrip
      279, // StripByteCounts
    ]);

    let foundTags = new Set();
    for (let i = 0; i < Math.min(20, arrayBuffer.byteLength - 8); i += 2) {
      const tag = dataView.getUint16(ifdOffset + 2 + i, isLittleEndian);
      foundTags.add(tag);
    }

    const missingTags = Array.from(requiredTags).filter(tag => !foundTags.has(tag));
    if (missingTags.length > 0) {
      console.warn('Missing required TIFF tags:', missingTags);
    }

    console.log('TIFF validation successful:', {
      byteOrder: isLittleEndian ? 'II' : 'MM',
      magicNumber,
      ifdOffset,
      fileSize: arrayBuffer.byteLength,
      foundTags: Array.from(foundTags)
    });
  } catch (error) {
    console.error('TIFF validation failed:', error);
    throw new Error(`Invalid TIFF structure: ${error.message}`);
  }
}