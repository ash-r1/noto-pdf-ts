/**
 * CommonJS Integration Test
 *
 * This test verifies that the package can be required correctly in a CJS environment.
 * It checks:
 * - Main entry point require (@noto-pdf-ts/core)
 * - Exported functions and values exist
 */

const assert = require('node:assert');

console.log('CJS Integration Test');
console.log('====================\n');

// Test: Main entry point
console.log('1. Testing main entry point (@noto-pdf-ts/core)...');
const main = require('@noto-pdf-ts/core');

assert.strictEqual(typeof main.VERSION, 'string', 'VERSION should be a string');
assert.strictEqual(typeof main.PDFiumLibrary, 'function', 'PDFiumLibrary should be a class');
assert.strictEqual(typeof main.openPdf, 'function', 'openPdf should be a function');
assert.strictEqual(typeof main.renderPdfPages, 'function', 'renderPdfPages should be a function');
assert.strictEqual(typeof main.getPageCount, 'function', 'getPageCount should be a function');
assert.strictEqual(typeof main.PdfError, 'function', 'PdfError should be a class');

console.log('   - VERSION:', main.VERSION);
console.log('   - PDFiumLibrary: OK');
console.log('   - openPdf: OK');
console.log('   - renderPdfPages: OK');
console.log('   - getPageCount: OK');
console.log('   - PdfError: OK');
console.log('   PASSED\n');

console.log('====================');
console.log('All CJS tests passed!');
