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
import { fileURLToPath } from 'node:url';
import { registerFonts } from './fonts.js';
import type { LoadPdfiumOptions, PDFiumModule } from './types.js';
import loadPdfiumModule from './wasm/pdfium.js';

/**
 * Path to the bundled Noto CJK font file.
 * Uses fileURLToPath for Node.js 20.0.0+ compatibility (import.meta.dirname requires 20.11.0+)
 */
const NOTO_CJK_FONT_PATH: string = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fonts/NotoSansCJK-Regular.ttc',
);

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
  } catch (error) {
    // Only warn for file-not-found errors (expected in development)
    // Re-throw other errors (permission issues, etc.)
    const isNotFoundError =
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT';

    if (isNotFoundError) {
      console.warn(
        'Noto CJK font not found, CJK text in PDFs without embedded fonts may not render correctly',
      );
    } else {
      throw error;
    }
  }

  return module;
}
