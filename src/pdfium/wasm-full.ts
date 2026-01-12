/**
 * PDFium Full WASM loader.
 *
 * This module loads the full variant of PDFium WASM which includes
 * embedded Noto CJK fonts for rendering PDFs without embedded fonts.
 *
 * @module pdfium/wasm-full
 */

import type { LoadPdfiumOptions, PDFiumModule } from './types.js';
import loadPdfiumFullModule from './wasm/pdfium-full.js';

/**
 * Loads the PDFium Full WASM module.
 *
 * The full variant includes embedded Noto CJK fonts (~5MB additional size)
 * for proper rendering of CJK characters in PDFs without embedded fonts.
 *
 * @param options - Optional configuration
 * @returns Promise resolving to the PDFium module
 */
export function loadPdfiumFull(options?: LoadPdfiumOptions): Promise<PDFiumModule> {
  return loadPdfiumFullModule(options);
}
