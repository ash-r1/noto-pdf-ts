/**
 * Tests for PDFiumLibrary instance management.
 *
 * These tests verify that:
 * - init() creates new independent instances
 * - destroy() properly cleans up resources
 * - NotoPdf provides proper high-level API
 *
 * Note: Tests create minimal WASM instances due to memory constraints.
 */

import { PDFDocument } from 'pdf-lib';
import { afterEach, describe, expect, it } from 'vitest';
import { PDFiumLibrary } from './library.js';

// Track created libraries for cleanup
const libraries: PDFiumLibrary[] = [];

afterEach(() => {
  // Clean up all created libraries
  for (const lib of libraries) {
    lib.destroy();
  }
  libraries.length = 0;
});

describe('PDFiumLibrary instance management', () => {
  it('should create new instance on each init() call', async () => {
    const library1 = await PDFiumLibrary.init();
    libraries.push(library1);

    const library2 = await PDFiumLibrary.init();
    libraries.push(library2);

    expect(library1).not.toBe(library2);
  });

  it('should load PDF documents', async () => {
    const library = await PDFiumLibrary.init();
    libraries.push(library);

    // Create a test PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([612, 792]);
    const pdfData = await pdfDoc.save();

    // Load document
    const doc = library.loadDocument(new Uint8Array(pdfData));
    expect(doc.getPageCount()).toBe(1);
    doc.destroy();
  });

  it('should support font registration', async () => {
    const library = await PDFiumLibrary.init();
    libraries.push(library);

    // Should not throw when registering empty fonts
    library.registerFonts([]);
  });

  it('should be safe to call destroy multiple times', async () => {
    const library = await PDFiumLibrary.init();
    // Don't add to libraries array since we're manually destroying

    library.destroy();
    library.destroy(); // Should not throw
  });
});

describe('NotoPdf high-level API', () => {
  it('should create NotoPdf instances', async () => {
    const { NotoPdf } = await import('../index.js');

    const notoPdf = await NotoPdf.init();

    // Create a test PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([612, 792]);
    const pdfData = await pdfDoc.save();

    const pdf = await notoPdf.openPdf(pdfData);
    expect(pdf.pageCount).toBe(1);
    await pdf.close();

    notoPdf.destroy();
  });

  it('should support fonts option in init', async () => {
    const { NotoPdf } = await import('../index.js');

    // Should work with empty fonts array
    const notoPdf = await NotoPdf.init({ fonts: [] });
    notoPdf.destroy();
  });

  it('should throw when using destroyed instance', async () => {
    const { NotoPdf } = await import('../index.js');

    const notoPdf = await NotoPdf.init();
    notoPdf.destroy();

    // Create a test PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([612, 792]);
    const pdfData = await pdfDoc.save();

    await expect(notoPdf.openPdf(pdfData)).rejects.toThrow('destroyed');
  });

  it('should process multiple PDFs with same instance', async () => {
    const { NotoPdf } = await import('../index.js');

    const notoPdf = await NotoPdf.init();

    // Create test PDFs
    const pdfDoc1 = await PDFDocument.create();
    pdfDoc1.addPage([612, 792]);
    const pdfData1 = await pdfDoc1.save();

    const pdfDoc2 = await PDFDocument.create();
    pdfDoc2.addPage([612, 792]);
    pdfDoc2.addPage([612, 792]);
    const pdfData2 = await pdfDoc2.save();

    // Process multiple PDFs
    const pdf1 = await notoPdf.openPdf(pdfData1);
    expect(pdf1.pageCount).toBe(1);
    await pdf1.close();

    const pdf2 = await notoPdf.openPdf(pdfData2);
    expect(pdf2.pageCount).toBe(2);
    await pdf2.close();

    notoPdf.destroy();
  });
});
