/**
 * CJK (Chinese, Japanese, Korean) PDF rendering tests.
 *
 * These tests verify that PDFs containing CJK characters are rendered correctly.
 * The tests cover various font types including TrueType, OpenType, and CID fonts.
 * All pages of each PDF are tested.
 *
 * To update snapshots when rendering changes intentionally:
 *   UPDATE_SNAPSHOTS=true pnpm test cjk-rendering
 *
 * @module cjk-rendering.test
 */

import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openPdf } from './index.js';
import { cleanupDiffs, createSnapshotMatcher } from './test-utils/image-comparison.js';

// Check if PDFium and sharp are available
let pdfiumAvailable = false;
try {
  const { PDFiumLibrary } = await import('./pdfium/index.js');
  await import('sharp');
  await PDFiumLibrary.init();
  pdfiumAvailable = true;
} catch (error) {
  console.warn('PDFium or sharp not available - skipping CJK rendering tests:', error);
}

const describeWithPdfium: typeof describe = pdfiumAvailable ? describe : describe.skip;

// Path to test fixtures (PDFs and snapshots are colocated)
const FIXTURES_DIR = path.join(import.meta.dirname, '../test-fixtures');
const FIXTURES_WITH_MISSING_GLYPHS_DIR = path.join(FIXTURES_DIR, 'with-missing-glyphs');

// Create snapshot matcher using fixtures directory as base
// Snapshots are stored alongside PDFs: test-fixtures/<path>/<name>/snapshots/<page>.png
const matchSnapshot = createSnapshotMatcher(path.join(FIXTURES_DIR, 'dummy.ts'), {
  threshold: 0.1,
  maxDiffPercentage: 1, // Allow 1% difference for cross-platform font rendering
  snapshotDir: '', // No extra subdirectory - path is fully specified in snapshot name
});

/**
 * Options for testAllPages helper
 */
interface TestAllPagesOptions {
  maxPages?: number;
  ignoreMissingGlyphs?: boolean;
}

/**
 * Helper function to test all pages of a PDF.
 * Snapshots are stored alongside PDFs: <pdfDir>/snapshots/<pageNum>.png
 */
async function testAllPages(pdfPath: string, options: TestAllPagesOptions = {}) {
  const { maxPages, ignoreMissingGlyphs } = options;
  // Get the relative path from FIXTURES_DIR to the PDF's directory
  const pdfDir = path.dirname(pdfPath);
  const relativePdfDir = path.relative(FIXTURES_DIR, pdfDir);
  const pdf = await openPdf(pdfPath);

  try {
    const totalPages = pdf.pageCount;
    expect(totalPages).toBeGreaterThan(0);

    const pageCount = maxPages ? Math.min(totalPages, maxPages) : totalPages;

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.renderPage(pageNum, {
        format: 'png',
        scale: 1.0,
        ignoreMissingGlyphs,
      });
      // Use hierarchical snapshot path: <relativePdfDir>/snapshots/<pageNum>
      const result = matchSnapshot(page.buffer, `${relativePdfDir}/snapshots/${pageNum}`);

      expect(
        result.match,
        `Page ${pageNum}/${pageCount} diff: ${result.diffPercentage.toFixed(2)}%`,
      ).toBe(true);
    }

    return pageCount;
  } finally {
    await pdf.close();
  }
}

describeWithPdfium('CJK Rendering Tests', () => {
  beforeAll(() => {
    cleanupDiffs(import.meta.url);
  });

  afterAll(() => {
    // Diff files are kept on failure for debugging
  });

  describe('Japanese PDFs', () => {
    it('SFAA_Japanese.pdf - should render first 5 pages correctly', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'jp/SFAA_Japanese/SFAA_Japanese.pdf');
      const pageCount = await testAllPages(pdfPath, { maxPages: 5 });
      expect(pageCount).toBe(5);
    });

    it('ichiji.pdf - should render all pages correctly', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'jp/ichiji/ichiji.pdf');
      const pageCount = await testAllPages(pdfPath);
      expect(pageCount).toBeGreaterThan(0);
    });

    it('TaroUTR50SortedList112.pdf - should render all pages with vertical text correctly', async () => {
      const pdfPath = path.join(
        FIXTURES_DIR,
        'jp/TaroUTR50SortedList112/TaroUTR50SortedList112.pdf',
      );
      const pageCount = await testAllPages(pdfPath);
      expect(pageCount).toBeGreaterThan(0);
    });

    it('cid_cff.pdf - should render all pages with CID-keyed CFF font correctly', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'jp/cid_cff/cid_cff.pdf');
      const pageCount = await testAllPages(pdfPath);
      expect(pageCount).toBeGreaterThan(0);
    });
  });

  describe('Chinese PDFs', () => {
    it('ap-chinese.pdf - should render all pages correctly', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'cn/ap-chinese/ap-chinese.pdf');
      const pageCount = await testAllPages(pdfPath);
      expect(pageCount).toBeGreaterThan(0);
    });
  });

  describe('CID and Unicode font PDFs', () => {
    it('ArabicCIDTrueType.pdf - should render all pages correctly', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'ArabicCIDTrueType/ArabicCIDTrueType.pdf');
      const pageCount = await testAllPages(pdfPath);
      expect(pageCount).toBeGreaterThan(0);
    });

    it('pdf20-utf8-test.pdf - should render all pages correctly', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'pdf20-utf8-test/pdf20-utf8-test.pdf');
      const pageCount = await testAllPages(pdfPath);
      expect(pageCount).toBeGreaterThan(0);
    });
  });

  describe('PDFs with missing glyphs', () => {
    // These PDFs have some characters with incomplete Unicode mappings.
    // We use ignoreMissingGlyphs: true to allow rendering with tofu boxes.

    it('arial_unicode_ab_cidfont.pdf - should render with tofu for missing glyphs', async () => {
      const pdfPath = path.join(
        FIXTURES_WITH_MISSING_GLYPHS_DIR,
        'jp/arial_unicode_ab_cidfont/arial_unicode_ab_cidfont.pdf',
      );
      const pageCount = await testAllPages(pdfPath, {
        ignoreMissingGlyphs: true,
      });
      expect(pageCount).toBeGreaterThan(0);
    });

    it('eps-hangul.pdf - should render all pages with tofu for missing glyphs', async () => {
      const pdfPath = path.join(FIXTURES_WITH_MISSING_GLYPHS_DIR, 'kr/eps-hangul/eps-hangul.pdf');
      const pageCount = await testAllPages(pdfPath, {
        ignoreMissingGlyphs: true,
      });
      expect(pageCount).toBeGreaterThan(0);
    });

    it('hangul-practice-worksheet.pdf - should render all pages with tofu for missing glyphs', async () => {
      const pdfPath = path.join(
        FIXTURES_WITH_MISSING_GLYPHS_DIR,
        'kr/hangul-practice-worksheet/hangul-practice-worksheet.pdf',
      );
      const pageCount = await testAllPages(pdfPath, {
        ignoreMissingGlyphs: true,
      });
      expect(pageCount).toBeGreaterThan(0);
    });
  });

  describe('CJK rendering consistency', () => {
    it('should produce identical output for same Japanese PDF rendered twice', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'jp/ichiji/ichiji.pdf');

      // First render
      const pdf1 = await openPdf(pdfPath);
      const page1 = await pdf1.renderPage(1, { format: 'png', scale: 1.0 });
      await pdf1.close();

      // Second render
      const pdf2 = await openPdf(pdfPath);
      const page2 = await pdf2.renderPage(1, { format: 'png', scale: 1.0 });
      await pdf2.close();

      // Compare the two renders
      const { compareImages } = await import('./test-utils/image-comparison.js');
      const result = compareImages(page1.buffer, page2.buffer);

      expect(result.match).toBe(true);
      expect(result.diffPixels).toBe(0);
    });

    it('should produce identical output for same Chinese PDF rendered twice', async () => {
      const pdfPath = path.join(FIXTURES_DIR, 'cn/ap-chinese/ap-chinese.pdf');

      // First render
      const pdf1 = await openPdf(pdfPath);
      const page1 = await pdf1.renderPage(1, { format: 'png', scale: 1.0 });
      await pdf1.close();

      // Second render
      const pdf2 = await openPdf(pdfPath);
      const page2 = await pdf2.renderPage(1, { format: 'png', scale: 1.0 });
      await pdf2.close();

      // Compare the two renders
      const { compareImages } = await import('./test-utils/image-comparison.js');
      const result = compareImages(page1.buffer, page2.buffer);

      expect(result.match).toBe(true);
      expect(result.diffPixels).toBe(0);
    });

    it('should produce identical output for same Korean PDF rendered twice', async () => {
      const pdfPath = path.join(FIXTURES_WITH_MISSING_GLYPHS_DIR, 'kr/eps-hangul/eps-hangul.pdf');

      // First render (ignoreMissingGlyphs because this PDF has incomplete Unicode mappings)
      const pdf1 = await openPdf(pdfPath);
      const page1 = await pdf1.renderPage(1, {
        format: 'png',
        scale: 1.0,
        ignoreMissingGlyphs: true,
      });
      await pdf1.close();

      // Second render
      const pdf2 = await openPdf(pdfPath);
      const page2 = await pdf2.renderPage(1, {
        format: 'png',
        scale: 1.0,
        ignoreMissingGlyphs: true,
      });
      await pdf2.close();

      // Compare the two renders
      const { compareImages } = await import('./test-utils/image-comparison.js');
      const result = compareImages(page1.buffer, page2.buffer);

      expect(result.match).toBe(true);
      expect(result.diffPixels).toBe(0);
    });
  });
});
