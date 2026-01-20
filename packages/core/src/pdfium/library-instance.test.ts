/**
 * Tests for PDFiumLibrary singleton pattern and instance management.
 *
 * These tests verify that:
 * - init() returns the same singleton instance
 * - reset() clears the singleton
 * - openPdf() uses the singleton correctly
 *
 * Note: Tests for create() are limited due to WASM memory constraints.
 * Each WASM instance consumes significant memory.
 */

import { PDFDocument } from 'pdf-lib';
import { afterEach, describe, expect, it } from 'vitest';
import { PDFiumLibrary } from './library.js';

// Reset library after each test to ensure isolation
afterEach(() => {
  PDFiumLibrary.reset();
});

describe('PDFiumLibrary singleton', () => {
  it('should return the same instance on multiple init() calls', async () => {
    const library1 = await PDFiumLibrary.init();
    const library2 = await PDFiumLibrary.init();

    expect(library1).toBe(library2);
  });

  it('should return the instance via getInstance() after init()', async () => {
    expect(PDFiumLibrary.getInstance()).toBeNull();

    const library = await PDFiumLibrary.init();

    expect(PDFiumLibrary.getInstance()).toBe(library);
  });

  it('should clear the singleton on reset()', async () => {
    await PDFiumLibrary.init();
    expect(PDFiumLibrary.getInstance()).not.toBeNull();

    PDFiumLibrary.reset();

    expect(PDFiumLibrary.getInstance()).toBeNull();
  });

  it('should handle multiple reset() calls safely', () => {
    // reset() should be idempotent
    PDFiumLibrary.reset();
    PDFiumLibrary.reset();
    PDFiumLibrary.reset();

    expect(PDFiumLibrary.getInstance()).toBeNull();
  });
});

describe('openPdf with library option', () => {
  it('should use the singleton library by default', async () => {
    // Initialize singleton first
    const library = await PDFiumLibrary.init();

    // Create a test PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([612, 792]);
    const pdfData = await pdfDoc.save();

    // Import openPdf
    const { openPdf } = await import('../index.js');

    // Open PDF (should use singleton)
    const pdf = await openPdf(pdfData);
    expect(pdf.pageCount).toBe(1);
    await pdf.close();

    // Verify singleton is still the same
    expect(PDFiumLibrary.getInstance()).toBe(library);
  });

  it('should use provided library instance when specified', async () => {
    // Use the singleton as the "provided" library
    const library = await PDFiumLibrary.init();

    // Create a test PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([612, 792]);
    const pdfData = await pdfDoc.save();

    // Import openPdf
    const { openPdf } = await import('../index.js');

    // Open PDF with explicit library parameter
    const pdf = await openPdf(pdfData, { library });
    expect(pdf.pageCount).toBe(1);
    await pdf.close();
  });
});

describe('memory management for long-running processes', () => {
  it('should allow recovery via reset() after processing PDFs', async () => {
    // Initialize
    const library = await PDFiumLibrary.init();
    expect(PDFiumLibrary.getInstance()).toBe(library);

    // Create a test PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([612, 792]);
    const pdfData = await pdfDoc.save();

    const { openPdf } = await import('../index.js');

    // Process some PDFs
    for (let i = 0; i < 3; i++) {
      const pdf = await openPdf(pdfData);
      expect(pdf.pageCount).toBe(1);
      await pdf.close();
    }

    // Reset library (simulate recovery from memory issues)
    PDFiumLibrary.reset();
    expect(PDFiumLibrary.getInstance()).toBeNull();

    // Re-initialize and verify we can continue processing
    await PDFiumLibrary.init();
    expect(PDFiumLibrary.getInstance()).not.toBeNull();

    const pdf = await openPdf(pdfData);
    expect(pdf.pageCount).toBe(1);
    await pdf.close();
  });
});
