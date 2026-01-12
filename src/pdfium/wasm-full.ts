/**
 * PDFium Full WASM loader.
 *
 * This module loads PDFium WASM and automatically registers Noto CJK fonts
 * for rendering PDFs that don't have embedded fonts.
 *
 * @module pdfium/wasm-full
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { registerFonts } from './fonts.js';
import type { LoadPdfiumOptions, PDFiumModule } from './types.js';
import loadPdfiumModule from './wasm/pdfium.js';

/**
 * Path to the bundled Noto CJK font file.
 */
const NOTO_CJK_FONT_PATH: string = path.join(import.meta.dirname, 'fonts/NotoSansCJK-Regular.ttc');

/**
 * Loads the PDFium Full WASM module with CJK font support.
 *
 * The full variant automatically loads and registers Noto CJK fonts
 * for proper rendering of CJK characters in PDFs without embedded fonts.
 *
 * @param options - Optional configuration
 * @returns Promise resolving to the PDFium module
 */
export async function loadPdfiumFull(options?: LoadPdfiumOptions): Promise<PDFiumModule> {
  const module = await loadPdfiumModule(options);

  // Load and register Noto CJK font
  try {
    const fontData = await fs.readFile(NOTO_CJK_FONT_PATH);
    registerFonts(module, [{ name: 'NotoSansCJK-Regular.ttc', data: new Uint8Array(fontData) }]);
  } catch {
    // Font file not found - this is expected in development before fonts are downloaded
    console.warn(
      'Noto CJK font not found, CJK text in PDFs without embedded fonts may not render correctly',
    );
  }

  return module;
}
