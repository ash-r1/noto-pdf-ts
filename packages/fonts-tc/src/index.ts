import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FontConfig } from '@noto-pdf-ts/core';

export const FONT_NAME = 'NotoSansTC-VF.ttf';

export function getFontPath(): string {
  const Dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(Dirname, 'fonts', FONT_NAME);
}

export async function getFontData(): Promise<Uint8Array> {
  const fontPath = getFontPath();
  const buffer = await readFile(fontPath);
  return new Uint8Array(buffer);
}

/**
 * Load the Noto Sans Traditional Chinese font configuration (default export for simple usage).
 *
 * @returns Promise resolving to FontConfig object
 *
 * @example
 * ```typescript
 * import { PDFiumLibrary } from '@noto-pdf-ts/core'
 * import loadFontTc from '@noto-pdf-ts/fonts-tc'
 *
 * const library = await PDFiumLibrary.init()
 * library.registerFonts([await loadFontTc()])
 * ```
 */
export default async function loadFont(): Promise<FontConfig> {
  return {
    name: FONT_NAME,
    data: await getFontData(),
  };
}
