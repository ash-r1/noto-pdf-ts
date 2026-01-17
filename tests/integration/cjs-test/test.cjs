/**
 * CommonJS Integration Test
 *
 * This test verifies that the package works correctly in a CJS environment.
 * It checks:
 * - Main entry point require (@noto-pdf-ts/core)
 * - Exported functions and values exist
 * - PDF conversion actually works (WASM loads correctly)
 */

const assert = require('node:assert');
const path = require('node:path');

const fixturesDir = path.join(__dirname, '../../../packages/core/test-fixtures');

async function runTests() {
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

  // Test: PDF conversion (verifies WASM loads correctly)
  console.log('2. Testing PDF conversion (WASM loading)...');

  const pdfPath = path.join(fixturesDir, 'shapes/shapes.pdf');
  const pdf = await main.openPdf(pdfPath);
  assert.strictEqual(pdf.pageCount, 1, 'PDF should have 1 page');

  let renderedCount = 0;
  for await (const rendered of pdf.renderPages({ format: 'jpeg', scale: 1 })) {
    assert.ok(rendered.buffer instanceof Buffer, 'Rendered page should have a Buffer');
    assert.ok(rendered.buffer.length > 0, 'Rendered buffer should not be empty');
    assert.strictEqual(rendered.pageNumber, 1, 'Page number should be 1');
    assert.ok(rendered.width > 0, 'Width should be positive');
    assert.ok(rendered.height > 0, 'Height should be positive');
    renderedCount++;
  }
  assert.strictEqual(renderedCount, 1, 'Should have rendered 1 page');

  await pdf.close();

  console.log('   - PDF opened: OK');
  console.log('   - WASM loaded successfully: OK');
  console.log('   - Page rendered to JPEG: OK');
  console.log('   PASSED\n');

  console.log('====================');
  console.log('All CJS tests passed!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
