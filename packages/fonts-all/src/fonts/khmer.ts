import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FontConfig } from '@noto-pdf-ts/core';

/** Font file name for Noto Sans Khmer */
export const FONT_NAME = 'NotoSansKhmer[wdth,wght].ttf';

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
 * Load the Noto Sans Khmer font configuration (Cambodian).
 *
 * @returns Promise resolving to FontConfig object
 *
 * @example
 * ```typescript
 * import { PDFiumLibrary } from '@noto-pdf-ts/core'
 * import loadKhmer from '@noto-pdf-ts/fonts-all/khmer'
 *
 * const library = await PDFiumLibrary.init()
 * library.registerFonts([await loadKhmer()])
 * ```
 */
export default async function loadFont(): Promise<FontConfig> {
  return {
    name: FONT_NAME,
    data: await getFontData(),
  };
}
