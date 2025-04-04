// Debug configuration
const ValidationConfig = {
  debug: false
} as const;

export function setValidationDebug(enabled: boolean) {
  (ValidationConfig as any).debug = enabled;
}

export function validateGeoTiff(arrayBuffer: ArrayBuffer): void {
  if (ValidationConfig.debug) {
    console.log('Validating GeoTIFF structure...');
  }
  
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
    
    if (ValidationConfig.debug) {
      console.log('Byte order:', isLittleEndian ? 'Little Endian (II)' : isBigEndian ? 'Big Endian (MM)' : 'Invalid');
    }
    
    if (!isLittleEndian && !isBigEndian) {
      throw new Error(`Invalid byte order marker: 0x${byteOrder.toString(16)}`);
    }

    // Check magic number (42 for classic TIFF, 43 for BigTIFF)
    const magicNumber = dataView.getUint16(2, isLittleEndian);
    if (ValidationConfig.debug) {
      console.log('Magic number:', magicNumber);
    }
    
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
      if (ValidationConfig.debug) {
        console.log('IFD entry count:', entryCount);
      }
      
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

      if (ValidationConfig.debug) {
        console.log('First IFD entry:', { tag, type, count });
      }

      // Read sample format (if present) to determine data type
      let sampleFormat = 1; // Default to unsigned integer
      let bitsPerSample = 8; // Default to 8 bits
      
      // Scan for SampleFormat (338) and BitsPerSample (258) tags
      for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifdOffset + 2 + (i * 12);
        const entryTag = dataView.getUint16(entryOffset, isLittleEndian);
        
        if (entryTag === 338) { // SampleFormat
          const valueOffset = dataView.getUint32(entryOffset + 8, isLittleEndian);
          sampleFormat = valueOffset;
        } else if (entryTag === 258) { // BitsPerSample
          const valueOffset = dataView.getUint32(entryOffset + 8, isLittleEndian);
          bitsPerSample = valueOffset;
        }
      }

      if (ValidationConfig.debug) {
        console.log('Data format:', {
          sampleFormat,
          bitsPerSample
        });
      }

      // Validate pixel data
      const stripOffsetsTag = 273;
      const stripByteCountsTag = 279;
      let dataOffset = 0;
      let dataLength = 0;

      // Find data location
      for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifdOffset + 2 + (i * 12);
        const entryTag = dataView.getUint16(entryOffset, isLittleEndian);
        
        if (entryTag === stripOffsetsTag) {
          dataOffset = dataView.getUint32(entryOffset + 8, isLittleEndian);
        } else if (entryTag === stripByteCountsTag) {
          dataLength = dataView.getUint32(entryOffset + 8, isLittleEndian);
        }
      }

      if (dataOffset && dataLength) {
        // Sample pixel values to check for uniformity
        const sampleSize = Math.min(1000, dataLength);
        const sampleInterval = Math.max(1, Math.floor(dataLength / sampleSize));
        let uniqueValues = new Set();
        let zeroCount = 0;
        let totalSamples = 0;

        for (let i = dataOffset; i < dataOffset + dataLength; i += sampleInterval) {
          let value;
          
          // Read value based on sample format and bits per sample
          if (sampleFormat === 1) { // Unsigned int
            value = bitsPerSample <= 8 ? dataView.getUint8(i) :
                   bitsPerSample <= 16 ? dataView.getUint16(i, isLittleEndian) :
                   dataView.getUint32(i, isLittleEndian);
          } else { // Float or signed int
            value = bitsPerSample <= 16 ? dataView.getInt16(i, isLittleEndian) :
                   bitsPerSample <= 32 ? dataView.getFloat32(i, isLittleEndian) :
                   dataView.getFloat64(i, isLittleEndian);
          }

          if (value === 0) zeroCount++;
          uniqueValues.add(value);
          totalSamples++;
        }

        const zeroPercentage = (zeroCount / totalSamples) * 100;
        const uniqueValueCount = uniqueValues.size;

        if (ValidationConfig.debug) {
          console.log('Pixel value analysis:', {
            sampledPixels: totalSamples,
            uniqueValues: uniqueValueCount,
            zeroPercentage: zeroPercentage.toFixed(2) + '%'
          });
        }

        // Warn if data looks suspicious
        if (uniqueValueCount === 1) {
          console.warn('WARNING: All sampled pixels have the same value!');
        }
        if (zeroPercentage > 95) {
          console.warn('WARNING: More than 95% of sampled pixels are zero!');
        }
        if (uniqueValueCount < 10) {
          console.warn('WARNING: Very low variety in pixel values (less than 10 unique values)');
        }
      }
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
      279  // StripByteCounts
    ]);

    let foundTags = new Set();
    for (let i = 0; i < Math.min(20, arrayBuffer.byteLength - 8); i += 2) {
      const tag = dataView.getUint16(ifdOffset + 2 + i, isLittleEndian);
      foundTags.add(tag);
    }

    const missingTags = Array.from(requiredTags).filter(tag => !foundTags.has(tag));
    if (missingTags.length > 0 && ValidationConfig.debug) {
      console.warn('Missing required TIFF tags:', missingTags);
    }

    if (ValidationConfig.debug) {
      console.log('GeoTIFF validation successful:', {
        byteOrder: isLittleEndian ? 'II' : 'MM',
        magicNumber,
        ifdOffset,
        fileSize: arrayBuffer.byteLength,
        foundTags: Array.from(foundTags)
      });
    }
  } catch (error) {
    console.error('GeoTIFF validation failed:', error);
    throw new Error(`Invalid GeoTIFF structure: ${error.message}`);
  }
}