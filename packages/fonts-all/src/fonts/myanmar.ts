import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FontConfig } from '@noto-pdf-ts/core';

/** Font file name for Noto Sans Myanmar */
export const FONT_NAME = 'NotoSansMyanmar[wdth,wght].ttf';

/** Get the path to the font file */
export function getFontPath(): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(dirname, 'fonts', FONT_NAME);
}

/** Load font data as Uint8Array */
export async function getFontData(): Promise<Uint8Array> {
  const fontPath = getFontPath();
  const buffer = await readFile(fontPath);
  return new Uint8Array(buffer);
}

/**
 * Load the Noto Sans Myanmar font configuration (Burmese).
 *
 * @returns Promise resolving to FontConfig object
 *
 * @example
 * ```typescript
 * import { PDFiumLibrary } from '@noto-pdf-ts/core'
 * import loadMyanmar from '@noto-pdf-ts/fonts-all/myanmar'
 *
 * const library = await PDFiumLibrary.init()
 * library.registerFonts([await loadMyanmar()])
 * ```
 */
export default async function loadFont(): Promise<FontConfig> {
  return {
    name: FONT_NAME,
    data: await getFontData(),
  };
}
