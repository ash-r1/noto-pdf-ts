/**
 * Non-embedded font rendering tests.
 *
 * These tests verify that PDFs with non-embedded fonts correctly throw
 * MISSING_FONT errors. In PDFium WASM environment, system fonts are not
 * accessible, so non-standard fonts cannot render correctly.
 *
 * The library now detects this condition and throws an error rather than
 * producing blank/incorrect output.
 *
 * @module non-embedded-font.test
 */

import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openPdf, PdfError } from './index.js';
import { cleanupDiffs } from './test-utils/image-comparison.js';

// Check if PDFium and sharp are available
let pdfiumAvailable = false;
try {
  const { PDFiumLibrary } = await import('./pdfium/index.js');
  await import('sharp');
  await PDFiumLibrary.init();
  pdfiumAvailable = true;
} catch (error) {
  console.warn('PDFium or sharp not available - skipping non-embedded font tests:', error);
}

const describeWithPdfium: typeof describe = pdfiumAvailable ? describe : describe.skip;

// Path to test fixtures
const FIXTURES_DIR: string = path.join(import.meta.dirname, '../fixtures/pdfs/unicode-charts');

/**
 * Test that a PDF with non-embedded fonts throws MISSING_FONT error
 */
async function expectMissingFontError(pdfPath: string): Promise<void> {
  const pdf = await openPdf(pdfPath);

  try {
    expect(pdf.pageCount).toBeGreaterThan(0);

    // Attempting to render should throw MISSING_FONT error
    await expect(pdf.renderPage(1, { format: 'png', scale: 1.5 })).rejects.toThrow(PdfError);

    // Verify it's specifically a MISSING_FONT error
    try {
      await pdf.renderPage(1, { format: 'png', scale: 1.5 });
    } catch (error) {
      expect(error).toBeInstanceOf(PdfError);
      expect((error as PdfError).code).toBe('MISSING_FONT');
      expect((error as PdfError).message).toContain('fonts without embedded font data');
    }
  } finally {
    await pdf.close();
  }
}

describeWithPdfium('Non-embedded Font Tests (CJK Tofu Issue)', () => {
  beforeAll(() => {
    cleanupDiffs(import.meta.url);
  });

  afterAll(() => {
    // Diff files are kept on failure for debugging
  });

  describe('CJK Unified Ideographs (without embedded fonts)', () => {
    it('cjk-unified-basic-nonembed.pdf - should throw MISSING_FONT error', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'cjk-unified-basic-nonembed.pdf');
      await expectMissingFontError(pdfPath);
    });

    it('cjk-ext-a-nonembed.pdf - should throw MISSING_FONT error', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'cjk-ext-a-nonembed.pdf');
      await expectMissingFontError(pdfPath);
    });

    it('cjk-ext-b-nonembed.pdf - should throw MISSING_FONT error', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'cjk-ext-b-nonembed.pdf');
      await expectMissingFontError(pdfPath);
    });
  });

  describe('Japanese Scripts (without embedded fonts)', () => {
    it('hiragana-nonembed.pdf - should throw MISSING_FONT error', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'hiragana-nonembed.pdf');
      await expectMissingFontError(pdfPath);
    });

    it('katakana-nonembed.pdf - should throw MISSING_FONT error', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'katakana-nonembed.pdf');
      await expectMissingFontError(pdfPath);
    });

    it('mixed-cjk-japanese-nonembed.pdf - should throw MISSING_FONT error', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'mixed-cjk-japanese-nonembed.pdf');
      await expectMissingFontError(pdfPath);
    });
  });

  describe('Korean Scripts (without embedded fonts)', () => {
    it('hangul-syllables-nonembed.pdf - should throw MISSING_FONT error', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'hangul-syllables-nonembed.pdf');
      await expectMissingFontError(pdfPath);
    });
  });

  describe('Chinese Scripts (without embedded fonts)', () => {
    it('mixed-cjk-chinese-nonembed.pdf - should throw MISSING_FONT error', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'mixed-cjk-chinese-nonembed.pdf');
      await expectMissingFontError(pdfPath);
    });
  });
});
