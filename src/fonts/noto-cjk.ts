/**
 * Noto Sans CJK font loader.
 *
 * This module provides utilities for loading Noto Sans CJK fonts
 * for use with the noto-pdf-ts/lite variant.
 *
 * @example
 * ```typescript
 * import { openPdf, registerFonts } from 'noto-pdf-ts/lite'
 * import { loadNotoCJKFont, NOTO_CJK_FONT_URL } from 'noto-pdf-ts/fonts/noto-cjk'
 *
 * // Load font from CDN
 * const fontData = await loadNotoCJKFont()
 * registerFonts([{ name: 'NotoSansCJK-Regular.ttc', data: fontData }])
 *
 * // Now render PDFs with CJK support
 * const pdf = await openPdf('/path/to/japanese-document.pdf')
 * ```
 *
 * @module fonts/noto-cjk
 */

/**
 * URL for Noto Sans CJK font download.
 *
 * This points to Google's Noto Sans CJK OTC (OpenType Collection) which
 * includes all CJK variants (Japanese, Simplified Chinese, Traditional Chinese, Korean).
 */
export const NOTO_CJK_FONT_URL =
  'https://github.com/notofonts/noto-cjk/releases/download/Sans2.004/03_NotoSansCJK-OTC.zip';

/**
 * Font file name in the Noto Sans CJK package.
 */
export const NOTO_CJK_FONT_NAME = 'NotoSansCJK-Regular.ttc';

/**
 * Loads the Noto Sans CJK font from a URL.
 *
 * Note: The default URL points to a ZIP file containing the OTC font.
 * This function handles the ZIP extraction automatically.
 *
 * @param url - Optional custom URL for the font file
 * @returns Promise resolving to the font data as Uint8Array
 *
 * @example
 * ```typescript
 * import { loadNotoCJKFont } from 'noto-pdf-ts/fonts/noto-cjk'
 * import { registerFonts } from 'noto-pdf-ts/lite'
 *
 * const fontData = await loadNotoCJKFont()
 * registerFonts([{ name: 'NotoSansCJK-Regular.ttc', data: fontData }])
 * ```
 */
export async function loadNotoCJKFont(url?: string): Promise<Uint8Array> {
  const targetUrl = url ?? NOTO_CJK_FONT_URL;

  // For Node.js environment, use node-fetch or built-in fetch
  const response = await fetch(targetUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch Noto CJK font: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  // If it's a ZIP file, extract it
  if (targetUrl.endsWith('.zip')) {
    return await extractFontFromZip(new Uint8Array(arrayBuffer));
  }

  return new Uint8Array(arrayBuffer);
}

/**
 * ZIP local file header signature.
 */
const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;

/**
 * Extracts the Noto Sans CJK font from a ZIP archive.
 *
 * Uses structured parsing of ZIP headers instead of byte-by-byte search.
 *
 * @param zipData - ZIP file data
 * @returns Font data as Uint8Array
 */
async function extractFontFromZip(zipData: Uint8Array): Promise<Uint8Array> {
  // Simple ZIP extraction for the specific font file
  // The ZIP structure is expected to be:
  // OTC/NotoSansCJK-Regular.ttc

  const targetFileName = 'NotoSansCJK-Regular.ttc';
  const dataView = new DataView(zipData.buffer, zipData.byteOffset, zipData.byteLength);
  let offset = 0;

  // ZIP files start with local file headers (PK\x03\x04)
  // Parse each header and jump to next, rather than byte-by-byte search
  while (offset < zipData.length - 30) {
    // Minimum header size is 30 bytes
    const signature = dataView.getUint32(offset, true);

    // Check for local file header signature
    if (signature !== ZIP_LOCAL_FILE_HEADER_SIGNATURE) {
      // Not a local file header - could be central directory or end of entries
      break;
    }

    // Read local file header fields
    const compressionMethod = dataView.getUint16(offset + 8, true);
    const compressedSize = dataView.getUint32(offset + 18, true);
    const fileNameLength = dataView.getUint16(offset + 26, true);
    const extraFieldLength = dataView.getUint16(offset + 28, true);

    const fileNameStart = offset + 30;
    const fileNameBytes = zipData.subarray(fileNameStart, fileNameStart + fileNameLength);
    const fileName = new TextDecoder().decode(fileNameBytes);

    const dataStart = fileNameStart + fileNameLength + extraFieldLength;

    if (fileName.endsWith(targetFileName)) {
      // Found our target file
      if (compressionMethod === 0) {
        // Stored (no compression)
        return zipData.subarray(dataStart, dataStart + compressedSize);
      }
      if (compressionMethod === 8) {
        // Deflate compression - need to decompress
        const compressedData = zipData.subarray(dataStart, dataStart + compressedSize);
        return await decompressDeflate(compressedData);
      }
      throw new Error(`Unsupported compression method: ${compressionMethod}`);
    }

    // Jump directly to next file header (no byte-by-byte search)
    offset = dataStart + compressedSize;
  }

  throw new Error(`Font file not found in ZIP: ${targetFileName}`);
}

/**
 * Decompresses deflate-compressed data.
 *
 * @param data - Compressed data
 * @returns Decompressed data
 */
async function decompressDeflate(data: Uint8Array): Promise<Uint8Array> {
  // Use DecompressionStream if available (modern browsers/Node.js 18+)
  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(data);
    writer.close();

    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
    }

    // Concatenate chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  // Fallback: Use zlib in Node.js
  const { inflateRaw } = await import('node:zlib');
  const { promisify } = await import('node:util');
  const inflateRawAsync = promisify(inflateRaw);
  const result = await inflateRawAsync(data);
  return new Uint8Array(result);
}

/**
 * Loads the Noto Sans CJK font from a local file path.
 *
 * @param filePath - Path to the font file (TTF, OTF, or TTC)
 * @returns Promise resolving to the font data as Uint8Array
 *
 * @example
 * ```typescript
 * import { loadNotoCJKFontFromFile } from 'noto-pdf-ts/fonts/noto-cjk'
 * import { registerFonts } from 'noto-pdf-ts/lite'
 *
 * const fontData = await loadNotoCJKFontFromFile('/path/to/NotoSansCJK-Regular.ttc')
 * registerFonts([{ name: 'NotoSansCJK-Regular.ttc', data: fontData }])
 * ```
 */
export async function loadNotoCJKFontFromFile(filePath: string): Promise<Uint8Array> {
  const { readFile } = await import('node:fs/promises');
  const buffer = await readFile(filePath);
  return new Uint8Array(buffer);
}
