/**
 * PDFium WASM module types.
 * Source: paulocoutinhox/pdfium-lib v7623
 */

import type { LoadPdfiumOptions, PDFiumModule as PDFiumModuleType } from '../types.js';

/**
 * Load PDFium WASM module.
 */
declare function loadPdfiumModule(options?: LoadPdfiumOptions): Promise<PDFiumModuleType>;

export default loadPdfiumModule;
