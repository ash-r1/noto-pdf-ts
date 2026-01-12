/**
 * noto-pdf-ts/lite - Lightweight PDF conversion library for Node.js
 *
 * This is the lightweight variant that does not include embedded CJK fonts.
 * For CJK font support, use the PDFiumLibrary API with registerFonts():
 *
 * @example
 * ```typescript
 * import { PDFiumLibrary } from 'noto-pdf-ts/lite'
 * import { loadNotoCJKFont } from 'noto-pdf-ts/fonts/noto-cjk'
 *
 * // Initialize PDFium library (lite variant)
 * const library = await PDFiumLibrary.initLite()
 *
 * // Load and register CJK fonts
 * const fontData = await loadNotoCJKFont()
 * library.registerFonts([{ name: 'NotoSansCJK-Regular.ttc', data: fontData }])
 *
 * // Load and render PDF with CJK support
 * const pdfData = await fs.readFile('/path/to/document.pdf')
 * const document = library.loadDocument(new Uint8Array(pdfData))
 * const page = document.getPage(0)
 * const image = page.render({ scale: 2.0 })
 *
 * // Cleanup
 * page.close()
 * document.destroy()
 * library.destroy()
 * ```
 *
 * For simpler use cases without custom fonts, use the openPdf() convenience function:
 *
 * @example
 * ```typescript
 * import { openPdf } from 'noto-pdf-ts/lite'
 *
 * const pdf = await openPdf('/path/to/document.pdf')
 * for await (const page of pdf.renderPages({ format: 'png' })) {
 *   await fs.writeFile(`page-${page.pageNumber}.png`, page.buffer)
 * }
 * await pdf.close()
 * ```
 *
 * @packageDocumentation
 */

import { PdfDocumentImpl } from './pdf-document.js';
import type {
  PdfDocument,
  PdfInput,
  PdfOpenOptions,
  RenderedPage,
  RenderOptions,
} from './types.js';

export const VERSION = '0.0.1';

// Re-export font management utilities for the lite variant
export {
  DEFAULT_FONT_DIR,
  listFonts,
  registerFonts,
  unregisterFont,
} from './pdfium/fonts.js';
// Re-export PDFium library for advanced use cases
export { PDFiumLibrary } from './pdfium/library.js';
export type { FontConfig } from './pdfium/types.js';
// Re-export types
export type {
  PageRange,
  PdfDocument,
  PdfErrorCode,
  PdfInput,
  PdfOpenOptions,
  RenderedPage,
  RenderFormat,
  RenderOptions,
} from './types.js';
// Re-export error class
export { PdfError } from './types.js';

/**
 * Open a PDF document from a file path, Buffer, Uint8Array, or ArrayBuffer
 *
 * Note: This is the lite variant. For CJK font support without embedded fonts,
 * use registerFonts() to add fonts before rendering.
 *
 * @param input - File path or binary data
 * @param options - Options for opening the PDF
 * @returns Promise resolving to a PdfDocument instance
 *
 * @example
 * ```typescript
 * // From file path
 * const pdf = await openPdf('/path/to/document.pdf')
 *
 * // With password
 * const pdf = await openPdf('/path/to/encrypted.pdf', { password: 'secret' })
 * ```
 */
export async function openPdf(input: PdfInput, options?: PdfOpenOptions): Promise<PdfDocument> {
  return await PdfDocumentImpl.open(input, options);
}

/**
 * Render all pages of a PDF to images
 *
 * This is a convenience function that opens the PDF, renders all pages,
 * and automatically closes the document when done.
 *
 * @param input - File path or binary data
 * @param options - Combined open and render options
 * @yields RenderedPage for each page
 *
 * @example
 * ```typescript
 * import { renderPdfPages } from 'noto-pdf-ts/lite'
 *
 * for await (const page of renderPdfPages('/path/to/document.pdf', { scale: 2 })) {
 *   console.log(`Page ${page.pageNumber}: ${page.width}x${page.height}`)
 *   await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
 * }
 * ```
 */
export async function* renderPdfPages(
  input: PdfInput,
  options?: PdfOpenOptions & RenderOptions,
): AsyncGenerator<RenderedPage, void, unknown> {
  const pdf = await openPdf(input, options);

  try {
    yield* pdf.renderPages(options);
  } finally {
    await pdf.close();
  }
}

/**
 * Get the page count of a PDF without rendering
 *
 * @param input - File path or binary data
 * @param options - Options for opening the PDF
 * @returns Promise resolving to the number of pages
 *
 * @example
 * ```typescript
 * const count = await getPageCount('/path/to/document.pdf')
 * console.log(`Document has ${count} pages`)
 * ```
 */
export async function getPageCount(input: PdfInput, options?: PdfOpenOptions): Promise<number> {
  const pdf = await openPdf(input, options);
  try {
    return pdf.pageCount;
  } finally {
    await pdf.close();
  }
}
