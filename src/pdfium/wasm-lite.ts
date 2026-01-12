/**
 * PDFium Lite WASM loader.
 *
 * This module loads the lite variant of PDFium WASM which does not include
 * embedded fonts. Use registerFonts() to add fonts manually if needed.
 *
 * @module pdfium/wasm-lite
 */

import type { LoadPdfiumOptions, PDFiumModule } from './types.js';
import loadPdfiumLiteModule from './wasm/pdfium-lite.js';

/**
 * Loads the PDFium Lite WASM module.
 *
 * The lite variant does not include embedded fonts (~4MB).
 * For CJK font support, use registerFonts() to add fonts manually.
 *
 * @param options - Optional configuration
 * @returns Promise resolving to the PDFium module
 */
export function loadPdfiumLite(options?: LoadPdfiumOptions): Promise<PDFiumModule> {
  return loadPdfiumLiteModule(options);
}
