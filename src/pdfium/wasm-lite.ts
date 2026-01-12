/**
 * PDFium Lite WASM loader.
 *
 * This module loads the PDFium WASM without any fonts.
 * Use registerFonts() to add fonts manually if needed.
 *
 * @module pdfium/wasm-lite
 */

import type { LoadPdfiumOptions, PDFiumModule } from './types.js';
import loadPdfiumModule from './wasm/pdfium.js';

/**
 * Loads the PDFium Lite WASM module.
 *
 * The lite variant does not include any fonts.
 * For CJK font support, use registerFonts() to add fonts manually.
 *
 * @param options - Optional configuration
 * @returns Promise resolving to the PDFium module
 */
export function loadPdfiumLite(options?: LoadPdfiumOptions): Promise<PDFiumModule> {
  return loadPdfiumModule(options);
}
