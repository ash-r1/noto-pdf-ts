/**
 * PDFium Full WASM loader.
 *
 * This module loads the full variant of PDFium WASM which includes
 * embedded Noto CJK fonts for rendering PDFs without embedded fonts.
 *
 * @module pdfium/wasm-full
 */

import type { PDFiumModule } from './types.js';

/**
 * Loads the PDFium Full WASM module.
 *
 * The full variant includes embedded Noto CJK fonts (~5MB additional size)
 * for proper rendering of CJK characters in PDFs without embedded fonts.
 *
 * @param options - Optional configuration
 * @returns Promise resolving to the PDFium module
 */
export function loadPdfiumFull(_options?: {
  locateFile?: (path: string) => string;
}): Promise<PDFiumModule> {
  // TODO: Replace with actual WASM import once built
  // The WASM file will be built by: pdfium-build/build.py --variant full
  //
  // Expected import:
  // import loadPdfium from './wasm/pdfium-full.js';
  // return loadPdfium(options);

  throw new Error(
    'PDFium Full WASM not yet built. Run: cd pdfium-build && docker build -t pdfium-wasm . && docker run -v $(pwd)/output:/output pdfium-wasm',
  );
}
