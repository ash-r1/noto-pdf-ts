/**
 * PDFium WASM module types.
 */

import type { LoadPdfiumOptions, PDFiumModule } from '../types.js';

/**
 * Load PDFium WASM module.
 *
 * @param options - Optional configuration for loading the module
 * @returns Promise resolving to the PDFium module
 */
declare function loadPdfium(options?: LoadPdfiumOptions): Promise<PDFiumModule>;

export default loadPdfium;
