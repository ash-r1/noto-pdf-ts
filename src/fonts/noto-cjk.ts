/**
 * Noto Sans CJK font loader.
 *
 * This module provides utilities for loading Noto Sans CJK fonts
 * for use with the pdf-simple/lite variant.
 *
 * @example
 * ```typescript
 * import { openPdf, registerFonts } from 'pdf-simple/lite'
 * import { loadNotoCJKFont, NOTO_CJK_FONT_URL } from 'pdf-simple/fonts/noto-cjk'
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
 * import { loadNotoCJKFont } from 'pdf-simple/fonts/noto-cjk'
 * import { registerFonts } from 'pdf-simple/lite'
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
 * Extracts the Noto Sans CJK font from a ZIP archive.
 *
 * @param zipData - ZIP file data
 * @returns Font data as Uint8Array
 */
async function extractFontFromZip(zipData: Uint8Array): Promise<Uint8Array> {
  // Simple ZIP extraction for the specific font file
  // The ZIP structure is expected to be:
  // OTC/NotoSansCJK-Regular.ttc

  const targetFileName = 'NotoSansCJK-Regular.ttc';

  // Find the local file header for our target file
  const dataView = new DataView(zipData.buffer);
  let offset = 0;

  while (offset < zipData.length - 4) {
    // Look for local file header signature (0x04034b50)
    const signature = dataView.getUint32(offset, true);
    if (signature !== 0x04034b50) {
      offset++;
      continue;
    }

    // Read local file header
    const fileNameLength = dataView.getUint16(offset + 26, true);
    const extraFieldLength = dataView.getUint16(offset + 28, true);
    const compressedSize = dataView.getUint32(offset + 18, true);
    const compressionMethod = dataView.getUint16(offset + 8, true);

    const fileNameStart = offset + 30;
    const fileNameBytes = zipData.slice(fileNameStart, fileNameStart + fileNameLength);
    const fileName = new TextDecoder().decode(fileNameBytes);

    const dataStart = fileNameStart + fileNameLength + extraFieldLength;

    if (fileName.endsWith(targetFileName)) {
      // Found our target file
      if (compressionMethod === 0) {
        // Stored (no compression)
        return zipData.slice(dataStart, dataStart + compressedSize);
      }
      if (compressionMethod === 8) {
        // Deflate compression - need to decompress
        const compressedData = zipData.slice(dataStart, dataStart + compressedSize);
        return await decompressDeflate(compressedData);
      }
      throw new Error(`Unsupported compression method: ${compressionMethod}`);
    }

    // Move to next file
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
 * import { loadNotoCJKFontFromFile } from 'pdf-simple/fonts/noto-cjk'
 * import { registerFonts } from 'pdf-simple/lite'
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
