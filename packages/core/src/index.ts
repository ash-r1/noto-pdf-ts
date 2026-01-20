/**
 * @noto-pdf-ts/core - PDF conversion library for Node.js
 *
 * A simple, memory-efficient library for converting PDF pages to images.
 * This core library does not include embedded fonts. Use separate font packages
 * for CJK language support.
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { NotoPdf } from '@noto-pdf-ts/core'
 * import loadFontJp from '@noto-pdf-ts/fonts-jp'
 *
 * const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })
 *
 * const pdf = await notoPdf.openPdf('/path/to/document.pdf')
 * console.log(`Pages: ${pdf.pageCount}`)
 *
 * for await (const page of pdf.renderPages({ format: 'jpeg', scale: 1.5 })) {
 *   console.log(`Rendered page ${page.pageNumber}/${page.totalPages}`)
 *   await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
 * }
 *
 * await pdf.close()
 * notoPdf.destroy()
 * ```
 *
 * @example
 * Processing multiple PDFs:
 * ```typescript
 * import { NotoPdf } from '@noto-pdf-ts/core'
 * import loadFontJp from '@noto-pdf-ts/fonts-jp'
 *
 * const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })
 *
 * for (const file of pdfFiles) {
 *   const pdf = await notoPdf.openPdf(file)
 *   for await (const page of pdf.renderPages()) {
 *     await fs.writeFile(`${file}-${page.pageNumber}.jpg`, page.buffer)
 *   }
 *   await pdf.close()
 * }
 *
 * notoPdf.destroy()
 * ```
 *
 * @packageDocumentation
 */

export const VERSION = '0.0.1';

export type { NotoPdfOptions, OpenPdfOptions } from './noto-pdf.js';
// Main API
export { NotoPdf } from './noto-pdf.js';

// Re-export PDFium library for advanced/low-level use
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
