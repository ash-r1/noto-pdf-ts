/**
 * @noto-pdf-ts/fonts-all
 *
 * Complete collection of Noto Sans fonts for noto-pdf-ts.
 * Supports 20+ scripts including CJK, Arabic, Hebrew, Indic, and more.
 *
 * This package supports tree-shaking - only fonts you import will be bundled.
 *
 * @example Individual imports (recommended for smaller bundles)
 * ```typescript
 * import loadJapanese from '@noto-pdf-ts/fonts-all/japanese'
 * import loadArabic from '@noto-pdf-ts/fonts-all/arabic'
 *
 * const fonts = await Promise.all([loadJapanese(), loadArabic()])
 * library.registerFonts(fonts)
 * ```
 *
 * @example Import all fonts
 * ```typescript
 * import { loadAllFonts } from '@noto-pdf-ts/fonts-all/all'
 *
 * const fonts = await loadAllFonts()
 * library.registerFonts(fonts)
 * ```
 *
 * @packageDocumentation
 */

// Re-export FontConfig type for convenience
export type { FontConfig } from '@noto-pdf-ts/core';
// All fonts
export { loadAllFonts, SUPPORTED_SCRIPTS } from './all.js';
// Middle East
export { default as loadArabic, FONT_NAME as ARABIC_FONT_NAME } from './fonts/arabic.js';
// Caucasus
export { default as loadArmenian, FONT_NAME as ARMENIAN_FONT_NAME } from './fonts/armenian.js';
export { default as loadBengali, FONT_NAME as BENGALI_FONT_NAME } from './fonts/bengali.js';
export {
  default as loadChineseSimplified,
  FONT_NAME as CHINESE_SIMPLIFIED_FONT_NAME,
} from './fonts/chinese-simplified.js';
export {
  default as loadChineseTraditional,
  FONT_NAME as CHINESE_TRADITIONAL_FONT_NAME,
} from './fonts/chinese-traditional.js';

// South Asia (Indic scripts)
export {
  default as loadDevanagari,
  FONT_NAME as DEVANAGARI_FONT_NAME,
} from './fonts/devanagari.js';
// Africa
export { default as loadEthiopic, FONT_NAME as ETHIOPIC_FONT_NAME } from './fonts/ethiopic.js';
export { default as loadGeorgian, FONT_NAME as GEORGIAN_FONT_NAME } from './fonts/georgian.js';
export { default as loadGujarati, FONT_NAME as GUJARATI_FONT_NAME } from './fonts/gujarati.js';
export { default as loadGurmukhi, FONT_NAME as GURMUKHI_FONT_NAME } from './fonts/gurmukhi.js';
export { default as loadHebrew, FONT_NAME as HEBREW_FONT_NAME } from './fonts/hebrew.js';
// CJK (Chinese, Japanese, Korean)
export { default as loadJapanese, FONT_NAME as JAPANESE_FONT_NAME } from './fonts/japanese.js';
export { default as loadKannada, FONT_NAME as KANNADA_FONT_NAME } from './fonts/kannada.js';
export { default as loadKhmer, FONT_NAME as KHMER_FONT_NAME } from './fonts/khmer.js';
export { default as loadKorean, FONT_NAME as KOREAN_FONT_NAME } from './fonts/korean.js';
export { default as loadLao, FONT_NAME as LAO_FONT_NAME } from './fonts/lao.js';
// Latin / Greek / Cyrillic
export { default as loadLatin, FONT_NAME as LATIN_FONT_NAME } from './fonts/latin.js';
export { default as loadMalayalam, FONT_NAME as MALAYALAM_FONT_NAME } from './fonts/malayalam.js';
export { default as loadMyanmar, FONT_NAME as MYANMAR_FONT_NAME } from './fonts/myanmar.js';
export { default as loadOriya, FONT_NAME as ORIYA_FONT_NAME } from './fonts/oriya.js';
export { default as loadSinhala, FONT_NAME as SINHALA_FONT_NAME } from './fonts/sinhala.js';
export { default as loadTamil, FONT_NAME as TAMIL_FONT_NAME } from './fonts/tamil.js';
export { default as loadTelugu, FONT_NAME as TELUGU_FONT_NAME } from './fonts/telugu.js';
// Southeast Asia
export { default as loadThai, FONT_NAME as THAI_FONT_NAME } from './fonts/thai.js';
