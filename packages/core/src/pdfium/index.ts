/**
 * PDFium WASM wrapper module.
 *
 * This module provides a TypeScript wrapper around the PDFium WASM library
 * with support for font management.
 *
 * @module pdfium
 */

export {
  DEFAULT_FONT_DIR,
  listFonts,
  PDFIUM_FONT_PATHS,
  registerFonts,
  unregisterFont,
} from './fonts.js';
export {
  PDFiumDocument,
  PDFiumLibrary,
  PDFiumPage,
  type RenderedImage,
  type RenderOptions,
} from './library.js';

export type {
  EmscriptenFS,
  FontConfig,
  LoadPdfiumOptions,
  PDFiumModule,
} from './types.js';

export { FPDFBitmap, FPDFErrorCode, FPDFRenderFlag } from './types.js';
