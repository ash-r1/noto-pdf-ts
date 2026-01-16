/**
 * Load all Noto Sans fonts at once.
 *
 * Note: This will load ALL fonts (~300MB+ total) which may not be desirable
 * for all applications. Consider using individual imports for better
 * performance and smaller bundle sizes.
 *
 * @example
 * ```typescript
 * import { loadAllFonts } from '@noto-pdf-ts/fonts-all/all'
 *
 * const fonts = await loadAllFonts()
 * library.registerFonts(fonts)
 * ```
 *
 * @packageDocumentation
 */

import type { FontConfig } from '@noto-pdf-ts/core';
import loadArabic from './fonts/arabic.js';
import loadArmenian from './fonts/armenian.js';
import loadBengali from './fonts/bengali.js';
import loadChineseSimplified from './fonts/chinese-simplified.js';
import loadChineseTraditional from './fonts/chinese-traditional.js';
import loadDevanagari from './fonts/devanagari.js';
import loadEthiopic from './fonts/ethiopic.js';
import loadGeorgian from './fonts/georgian.js';
import loadGujarati from './fonts/gujarati.js';
import loadGurmukhi from './fonts/gurmukhi.js';
import loadHebrew from './fonts/hebrew.js';
import loadJapanese from './fonts/japanese.js';
import loadKannada from './fonts/kannada.js';
import loadKhmer from './fonts/khmer.js';
import loadKorean from './fonts/korean.js';
import loadLao from './fonts/lao.js';
import loadLatin from './fonts/latin.js';
import loadMalayalam from './fonts/malayalam.js';
import loadMyanmar from './fonts/myanmar.js';
import loadOriya from './fonts/oriya.js';
import loadSinhala from './fonts/sinhala.js';
import loadTamil from './fonts/tamil.js';
import loadTelugu from './fonts/telugu.js';
import loadThai from './fonts/thai.js';

/**
 * List of all supported scripts/languages
 */
export const SUPPORTED_SCRIPTS = [
  'latin', // Latin, Greek, Cyrillic
  'japanese',
  'korean',
  'chinese-simplified',
  'chinese-traditional',
  'arabic',
  'hebrew',
  'devanagari', // Hindi, Sanskrit, Marathi, etc.
  'bengali', // Bengali, Assamese
  'tamil',
  'telugu',
  'gujarati',
  'kannada',
  'malayalam',
  'oriya', // Odia
  'gurmukhi', // Punjabi
  'sinhala', // Sri Lanka
  'thai',
  'lao',
  'myanmar', // Burmese
  'khmer', // Cambodian
  'armenian',
  'georgian',
  'ethiopic', // Amharic, Tigrinya, etc.
] as const;

export type SupportedScript = (typeof SUPPORTED_SCRIPTS)[number];

/**
 * All font loaders mapped by script name
 */
const fontLoaders: Record<SupportedScript, () => Promise<FontConfig>> = {
  latin: loadLatin,
  japanese: loadJapanese,
  korean: loadKorean,
  'chinese-simplified': loadChineseSimplified,
  'chinese-traditional': loadChineseTraditional,
  arabic: loadArabic,
  hebrew: loadHebrew,
  devanagari: loadDevanagari,
  bengali: loadBengali,
  tamil: loadTamil,
  telugu: loadTelugu,
  gujarati: loadGujarati,
  kannada: loadKannada,
  malayalam: loadMalayalam,
  oriya: loadOriya,
  gurmukhi: loadGurmukhi,
  sinhala: loadSinhala,
  thai: loadThai,
  lao: loadLao,
  myanmar: loadMyanmar,
  khmer: loadKhmer,
  armenian: loadArmenian,
  georgian: loadGeorgian,
  ethiopic: loadEthiopic,
};

/**
 * Load all Noto Sans fonts.
 *
 * Warning: This loads ALL fonts (~300MB+ total). Consider using individual
 * imports or loadFonts() with specific scripts for better performance.
 *
 * @returns Promise resolving to array of FontConfig objects
 */
export function loadAllFonts(): Promise<FontConfig[]> {
  const loaders = Object.values(fontLoaders);
  return Promise.all(loaders.map((loader) => loader()));
}

/**
 * Load fonts for specific scripts only.
 *
 * @param scripts - Array of script names to load
 * @returns Promise resolving to array of FontConfig objects
 *
 * @example
 * ```typescript
 * import { loadFonts } from '@noto-pdf-ts/fonts-all/all'
 *
 * // Load only Japanese and Arabic fonts
 * const fonts = await loadFonts(['japanese', 'arabic'])
 * library.registerFonts(fonts)
 * ```
 */
export function loadFonts(scripts: SupportedScript[]): Promise<FontConfig[]> {
  const loaders = scripts.map((script) => {
    const loader = fontLoaders[script];
    if (!loader) {
      throw new Error(
        `Unknown script: ${script}. Supported scripts: ${SUPPORTED_SCRIPTS.join(', ')}`,
      );
    }
    return loader();
  });
  return Promise.all(loaders);
}

/**
 * Get font loader for a specific script.
 *
 * @param script - Script name
 * @returns Font loader function
 */
export function getFontLoader(script: SupportedScript): () => Promise<FontConfig> {
  const loader = fontLoaders[script];
  if (!loader) {
    throw new Error(
      `Unknown script: ${script}. Supported scripts: ${SUPPORTED_SCRIPTS.join(', ')}`,
    );
  }
  return loader;
}
