/**
 * CommonJS Integration Test
 *
 * This test verifies that the package can be required correctly in a CJS environment.
 * It checks:
 * - Main entry point require
 * - Subpath exports (lite, fonts/noto-cjk)
 * - Exported functions and values exist
 */

const assert = require('node:assert');

console.log('CJS Integration Test');
console.log('====================\n');

// Test 1: Main entry point
console.log('1. Testing main entry point (noto-pdf-ts)...');
const main = require('noto-pdf-ts');

assert.strictEqual(typeof main.VERSION, 'string', 'VERSION should be a string');
assert.strictEqual(typeof main.openPdf, 'function', 'openPdf should be a function');
assert.strictEqual(typeof main.renderPdfPages, 'function', 'renderPdfPages should be a function');
assert.strictEqual(typeof main.getPageCount, 'function', 'getPageCount should be a function');
assert.strictEqual(typeof main.PdfError, 'function', 'PdfError should be a class');

console.log('   - VERSION:', main.VERSION);
console.log('   - openPdf: OK');
console.log('   - renderPdfPages: OK');
console.log('   - getPageCount: OK');
console.log('   - PdfError: OK');
console.log('   PASSED\n');

// Test 2: Lite entry point
console.log('2. Testing lite entry point (noto-pdf-ts/lite)...');
const lite = require('noto-pdf-ts/lite');

assert.strictEqual(typeof lite.VERSION, 'string', 'VERSION should be a string');
assert.strictEqual(typeof lite.openPdf, 'function', 'openPdf should be a function');
assert.strictEqual(typeof lite.renderPdfPages, 'function', 'renderPdfPages should be a function');
assert.strictEqual(typeof lite.getPageCount, 'function', 'getPageCount should be a function');
assert.strictEqual(typeof lite.PdfError, 'function', 'PdfError should be a class');
assert.strictEqual(typeof lite.PDFiumLibrary, 'function', 'PDFiumLibrary should be a class');
assert.strictEqual(typeof lite.registerFonts, 'function', 'registerFonts should be a function');
assert.strictEqual(typeof lite.listFonts, 'function', 'listFonts should be a function');

console.log('   - VERSION:', lite.VERSION);
console.log('   - openPdf: OK');
console.log('   - PDFiumLibrary: OK');
console.log('   - registerFonts: OK');
console.log('   PASSED\n');

// Test 3: Fonts entry point
console.log('3. Testing fonts entry point (noto-pdf-ts/fonts/noto-cjk)...');
const fonts = require('noto-pdf-ts/fonts/noto-cjk');

assert.strictEqual(typeof fonts.NOTO_CJK_FONT_URL, 'string', 'NOTO_CJK_FONT_URL should be a string');
assert.strictEqual(typeof fonts.NOTO_CJK_FONT_NAME, 'string', 'NOTO_CJK_FONT_NAME should be a string');
assert.strictEqual(typeof fonts.loadNotoCJKFont, 'function', 'loadNotoCJKFont should be a function');
assert.strictEqual(typeof fonts.loadNotoCJKFontFromFile, 'function', 'loadNotoCJKFontFromFile should be a function');

console.log('   - NOTO_CJK_FONT_URL:', fonts.NOTO_CJK_FONT_URL.substring(0, 50) + '...');
console.log('   - NOTO_CJK_FONT_NAME:', fonts.NOTO_CJK_FONT_NAME);
console.log('   - loadNotoCJKFont: OK');
console.log('   - loadNotoCJKFontFromFile: OK');
console.log('   PASSED\n');

console.log('====================');
console.log('All CJS tests passed!');
