/**
 * @noto-pdf-ts/core - PDF conversion library for Node.js
 *
 * A simple, memory-efficient library for converting PDF pages to images.
 * This core library does not include embedded fonts. Use separate font packages
 * for CJK language support.
 *
 * @example
 * Basic usage without CJK fonts:
 * ```typescript
 * import { openPdf } from '@noto-pdf-ts/core'
 *
 * const pdf = await openPdf('/path/to/document.pdf')
 * console.log(`Pages: ${pdf.pageCount}`)
 *
 * for await (const page of pdf.renderPages({ format: 'jpeg', scale: 1.5 })) {
 *   console.log(`Rendered page ${page.pageNumber}/${page.totalPages}`)
 *   await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
 * }
 *
 * await pdf.close()
 * ```
 *
 * @example
 * With CJK font support:
 * ```typescript
 * import { PDFiumLibrary, openPdf } from '@noto-pdf-ts/core'
 * import loadFontJp from '@noto-pdf-ts/fonts-jp'
 *
 * // Initialize library and register Japanese font
 * const library = await PDFiumLibrary.init()
 * library.registerFonts([await loadFontJp()])
 *
 * const pdf = await openPdf('/path/to/japanese.pdf')
 * for await (const page of pdf.renderPages()) {
 *   await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
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

// Re-export PDFium library for advanced font management
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
// Re-export error class and type
export { PdfError } from './types.js';

/**
 * Open a PDF document from a file path, Buffer, Uint8Array, or ArrayBuffer
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
 * // From Buffer
 * const buffer = await fs.readFile('/path/to/document.pdf')
 * const pdf = await openPdf(buffer)
 *
 * // From Uint8Array
 * const response = await fetch('https://example.com/document.pdf')
 * const data = new Uint8Array(await response.arrayBuffer())
 * const pdf = await openPdf(data)
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
 * import { renderPdfPages } from 'noto-pdf-ts'
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
 * This is useful when you only need to know the number of pages.
 * The document is opened and closed automatically.
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
