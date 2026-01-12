/**
 * PDFium Lite WASM loader.
 *
 * This module loads the lite variant of PDFium WASM which does not include
 * embedded fonts. Use registerFonts() to add fonts manually if needed.
 *
 * @module pdfium/wasm-lite
 */

import type { PDFiumModule } from './types.js';

/**
 * Loads the PDFium Lite WASM module.
 *
 * The lite variant does not include embedded fonts (~4MB).
 * For CJK font support, use registerFonts() to add fonts manually.
 *
 * @param options - Optional configuration
 * @returns Promise resolving to the PDFium module
 */
export function loadPdfiumLite(_options?: {
  locateFile?: (path: string) => string;
}): Promise<PDFiumModule> {
  // TODO: Replace with actual WASM import once built
  // The WASM file will be built by: pdfium-build/build.py --variant lite
  //
  // Expected import:
  // import loadPdfium from './wasm/pdfium-lite.js';
  // return loadPdfium(options);

  throw new Error(
    'PDFium Lite WASM not yet built. Run: cd pdfium-build && docker build -t pdfium-wasm . && docker run -v $(pwd)/output:/output pdfium-wasm',
  );
}
