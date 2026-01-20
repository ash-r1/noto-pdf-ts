/**
 * NotoPdf - High-level API for PDF rendering.
 *
 * This module provides the main user-facing API for opening and rendering PDFs.
 * It wraps the low-level PDFiumLibrary and provides a clean, type-safe interface.
 *
 * @module noto-pdf
 */

import { PdfDocumentImpl } from './pdf-document.js';
import { PDFiumLibrary } from './pdfium/library.js';
import type { FontConfig } from './pdfium/types.js';
import type { PdfDocument, PdfInput } from './types.js';

/**
 * Options for initializing NotoPdf.
 *
 * @example
 * ```typescript
 * // Initialize with Japanese fonts
 * const notoPdf = await NotoPdf.init({
 *   fonts: [await loadFontJp()]
 * })
 * ```
 */
export interface NotoPdfOptions {
  /**
   * Fonts to register during initialization.
   *
   * Font packages like `@noto-pdf-ts/fonts-jp` provide font configurations
   * that can be passed here.
   *
   * @example
   * ```typescript
   * import loadFontJp from '@noto-pdf-ts/fonts-jp'
   * import loadFontKr from '@noto-pdf-ts/fonts-kr'
   *
   * const notoPdf = await NotoPdf.init({
   *   fonts: [await loadFontJp(), await loadFontKr()]
   * })
   * ```
   */
  fonts?: FontConfig[];
}

/**
 * Options for opening a PDF document.
 */
export interface OpenPdfOptions {
  /**
   * Password for opening encrypted PDFs.
   *
   * If the PDF is encrypted and no password is provided,
   * a {@link PdfError} with code `PASSWORD_REQUIRED` will be thrown.
   */
  password?: string;
}

/**
 * High-level API for PDF rendering with font support.
 *
 * NotoPdf provides a clean, type-safe interface for opening PDFs and
 * rendering them to images. It manages the underlying PDFium library
 * and font registration.
 *
 * **Usage:**
 * 1. Create an instance with `NotoPdf.init()`
 * 2. Open PDFs with `openPdf()`
 * 3. Render pages with the returned `PdfDocument`
 * 4. Call `destroy()` when done to free resources
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
 * for await (const page of pdf.renderPages()) {
 *   await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
 * }
 * await pdf.close()
 *
 * notoPdf.destroy()
 * ```
 *
 * @example
 * Processing multiple PDFs:
 * ```typescript
 * const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })
 *
 * for (const file of pdfFiles) {
 *   const pdf = await notoPdf.openPdf(file)
 *   for await (const page of pdf.renderPages()) {
 *     // Process pages...
 *   }
 *   await pdf.close()
 * }
 *
 * notoPdf.destroy()
 * ```
 */
export class NotoPdf {
  private readonly library: PDFiumLibrary;
  private destroyed = false;

  private constructor(library: PDFiumLibrary) {
    this.library = library;
  }

  /**
   * Initializes NotoPdf with optional font configuration.
   *
   * Each call creates a new, independent instance. You are responsible
   * for calling `destroy()` when done.
   *
   * @param options - Initialization options including fonts
   * @returns Promise resolving to a new NotoPdf instance
   *
   * @example
   * ```typescript
   * // Without fonts (for PDFs with embedded fonts)
   * const notoPdf = await NotoPdf.init()
   *
   * // With Japanese fonts
   * const notoPdf = await NotoPdf.init({
   *   fonts: [await loadFontJp()]
   * })
   * ```
   */
  public static async init(options?: NotoPdfOptions): Promise<NotoPdf> {
    const library = await PDFiumLibrary.init();
    const instance = new NotoPdf(library);

    if (options?.fonts && options.fonts.length > 0) {
      instance.registerFonts(options.fonts);
    }

    return instance;
  }

  /**
   * Registers additional fonts after initialization.
   *
   * Use this method when you need to add fonts dynamically,
   * for example based on detected PDF content.
   *
   * @param fonts - Array of font configurations to register
   *
   * @example
   * ```typescript
   * const notoPdf = await NotoPdf.init()
   *
   * // Add fonts later based on document analysis
   * if (needsJapaneseFont) {
   *   notoPdf.registerFonts([await loadFontJp()])
   * }
   * ```
   */
  public registerFonts(fonts: FontConfig[]): void {
    this.ensureNotDestroyed();
    this.library.registerFonts(fonts);
  }

  /**
   * Opens a PDF document for rendering.
   *
   * The returned `PdfDocument` must be closed when done using `close()`
   * or the `await using` syntax.
   *
   * @param input - File path, Buffer, Uint8Array, or ArrayBuffer
   * @param options - Options for opening the PDF (password, etc.)
   * @returns Promise resolving to a PdfDocument instance
   *
   * @example
   * ```typescript
   * // From file path
   * const pdf = await notoPdf.openPdf('/path/to/document.pdf')
   *
   * // From Buffer
   * const buffer = await fs.readFile('/path/to/document.pdf')
   * const pdf = await notoPdf.openPdf(buffer)
   *
   * // With password
   * const pdf = await notoPdf.openPdf('/path/to/encrypted.pdf', {
   *   password: 'secret'
   * })
   *
   * // Using await using (auto-close)
   * await using pdf = await notoPdf.openPdf('document.pdf')
   * ```
   */
  public async openPdf(input: PdfInput, options?: OpenPdfOptions): Promise<PdfDocument> {
    this.ensureNotDestroyed();
    return PdfDocumentImpl.open(input, this.library, options?.password);
  }

  /**
   * Destroys the instance and frees all resources.
   *
   * After calling this method, the instance cannot be used anymore.
   * This method is idempotent (safe to call multiple times).
   *
   * @example
   * ```typescript
   * const notoPdf = await NotoPdf.init()
   * // ... use notoPdf ...
   * notoPdf.destroy()
   * ```
   */
  public destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.library.destroy();
  }

  /**
   * Implements AsyncDisposable for use with `await using`.
   *
   * @example
   * ```typescript
   * await using notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })
   * const pdf = await notoPdf.openPdf('document.pdf')
   * // ... use pdf ...
   * // notoPdf.destroy() is called automatically when scope exits
   * ```
   */
  public async [Symbol.asyncDispose](): Promise<void> {
    this.destroy();
  }

  /**
   * Ensures the instance has not been destroyed.
   *
   * @throws Error if the instance has been destroyed
   * @internal
   */
  private ensureNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('NotoPdf instance has been destroyed');
    }
  }
}
