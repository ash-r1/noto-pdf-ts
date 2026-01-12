/**
 * Font management for PDFium WASM.
 *
 * This module provides utilities for loading fonts into the
 * PDFium WASM virtual filesystem.
 *
 * @module pdfium/fonts
 */

import type { EmscriptenFS, FontConfig, PDFiumModule } from './types.js';

/**
 * Default font directory in the WASM virtual filesystem.
 */
export const DEFAULT_FONT_DIR = '/fonts';

/**
 * Font directories that PDFium searches by default.
 */
export const PDFIUM_FONT_PATHS: string[] = [
  '/fonts',
  '/usr/share/fonts',
  '/usr/share/X11/fonts/Type1',
  '/usr/share/X11/fonts/TTF',
  '/usr/local/share/fonts',
];

/**
 * Ensures a directory exists in the virtual filesystem.
 * Creates parent directories as needed.
 *
 * @param fs - Emscripten filesystem
 * @param path - Directory path to create
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Necessary for robust directory creation with error handling
function ensureDirectory(fs: EmscriptenFS, path: string): void {
  const parts = path.split('/').filter(Boolean);
  let currentPath = '';

  for (const part of parts) {
    currentPath += `/${part}`;
    try {
      const stat = fs.stat(currentPath);
      if (!fs.isDir(stat.mode)) {
        throw new Error(`Path exists but is not a directory: ${currentPath}`);
      }
    } catch (error) {
      // Directory doesn't exist, create it
      if (
        error instanceof Error &&
        (error.message.includes('no such file') ||
          error.message.includes('ENOENT') ||
          error.message.includes('FS error'))
      ) {
        try {
          fs.mkdir(currentPath);
        } catch (mkdirError) {
          // Ignore "file exists" errors (race condition)
          if (!(mkdirError instanceof Error && mkdirError.message.includes('exists'))) {
            throw mkdirError;
          }
        }
      } else {
        throw error;
      }
    }
  }
}

/**
 * Registers fonts in the PDFium WASM virtual filesystem.
 *
 * This function writes font files to the virtual filesystem so that
 * PDFium can use them when rendering PDFs without embedded fonts.
 *
 * @param module - PDFium WASM module
 * @param fonts - Array of font configurations
 * @param directory - Directory to place fonts (default: /fonts)
 *
 * @example
 * ```typescript
 * import { registerFonts } from 'pdf-simple/lite';
 *
 * const fontData = await fs.readFile('NotoSansCJK-Regular.ttc');
 * registerFonts(module, [
 *   { name: 'NotoSansCJK-Regular.ttc', data: new Uint8Array(fontData) }
 * ]);
 * ```
 */
export function registerFonts(
  module: PDFiumModule,
  fonts: FontConfig[],
  directory: string = DEFAULT_FONT_DIR,
): void {
  const fs = module.FS;

  // Ensure font directory exists
  ensureDirectory(fs, directory);

  // Write each font file
  for (const font of fonts) {
    const fontPath = `${directory}/${font.name}`;
    fs.writeFile(fontPath, font.data);
  }
}

/**
 * Lists registered fonts in a directory.
 *
 * @param module - PDFium WASM module
 * @param directory - Directory to list (default: /fonts)
 * @returns Array of font file names
 */
export function listFonts(module: PDFiumModule, directory: string = DEFAULT_FONT_DIR): string[] {
  const fs = module.FS;

  try {
    return fs.readdir(directory).filter((name) => {
      // Filter out . and .. and only include font files
      if (name === '.' || name === '..') {
        return false;
      }
      const ext = name.toLowerCase().split('.').pop();
      return ['ttf', 'otf', 'ttc', 'woff', 'woff2'].includes(ext || '');
    });
  } catch {
    return [];
  }
}

/**
 * Removes a registered font from the virtual filesystem.
 *
 * @param module - PDFium WASM module
 * @param fontName - Name of the font file to remove
 * @param directory - Directory containing the font (default: /fonts)
 */
export function unregisterFont(
  module: PDFiumModule,
  fontName: string,
  directory: string = DEFAULT_FONT_DIR,
): void {
  const fs = module.FS;
  const fontPath = `${directory}/${fontName}`;

  try {
    fs.unlink(fontPath);
  } catch {
    // Ignore errors (font might not exist)
  }
}
