import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FontConfig } from '@noto-pdf-ts/core';

export const FONT_NAME = 'NotoSansCJK-VF.ttf.ttc';

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
 * Load the Noto Sans CJK font configuration (default export for simple usage).
 *
 * This package includes all CJK languages (Japanese, Korean, Simplified Chinese, Traditional Chinese)
 * in a single TTC file. Use individual font packages (fonts-jp, fonts-kr, etc.) if you only need
 * one language to reduce bundle size.
 *
 * @returns Promise resolving to FontConfig object
 *
 * @example
 * ```typescript
 * import { PDFiumLibrary } from '@noto-pdf-ts/core'
 * import loadFontCjk from '@noto-pdf-ts/fonts-cjk'
 *
 * const library = await PDFiumLibrary.init()
 * library.registerFonts([await loadFontCjk()])
 * ```
 */
export default async function loadFont(): Promise<FontConfig> {
  return {
    name: FONT_NAME,
    data: await getFontData(),
  };
}
