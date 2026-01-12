/**
 * PDF Document implementation using PDFium.
 *
 * This module contains the internal implementation of the PDF document
 * handling. It uses PDFium for PDF parsing and rendering,
 * which provides stable TrueType embedded font support.
 *
 * @module pdf-document
 * @internal
 */

import fs from 'node:fs/promises';
import sharp from 'sharp';
import { DEFAULT_RENDER_OPTIONS } from './config.js';
import { type PDFiumDocument, PDFiumLibrary } from './pdfium/index.js';
import type {
  PageRange,
  PdfDocument,
  PdfInput,
  PdfOpenOptions,
  RenderedPage,
  RenderOptions,
} from './types.js';
import { PdfError } from './types.js';

/**
 * Converts BGRA pixel data to RGBA by swapping red and blue channels.
 *
 * PDFium renders in BGRA format, but most image libraries (including sharp)
 * expect RGBA format.
 *
 * @param bgra - BGRA pixel data
 * @returns RGBA pixel data
 * @internal
 */
function convertBgraToRgba(bgra: Uint8Array): Uint8Array {
  const rgba = new Uint8Array(bgra.length);
  for (let i = 0; i < bgra.length; i += 4) {
    rgba[i] = bgra[i + 2] as number; // R <- B
    rgba[i + 1] = bgra[i + 1] as number; // G <- G
    rgba[i + 2] = bgra[i] as number; // B <- R
    rgba[i + 3] = bgra[i + 3] as number; // A <- A
  }
  return rgba;
}

/**
 * Cached PDFium library instance.
 * @internal
 */
let libraryInstance: PDFiumLibrary | null = null;

/**
 * PDF Base 14 fonts that don't require embedding.
 * These are the standard fonts defined in PDF 1.0 specification.
 * @internal
 */
const PDF_BASE_14_FONTS = new Set([
  'Courier',
  'Courier-Bold',
  'Courier-BoldOblique',
  'Courier-Oblique',
  'Helvetica',
  'Helvetica-Bold',
  'Helvetica-BoldOblique',
  'Helvetica-Oblique',
  'Times-Roman',
  'Times-Bold',
  'Times-BoldItalic',
  'Times-Italic',
  'Symbol',
  'ZapfDingbats',
]);

/**
 * Checks if a font name is a PDF Base 14 font (standard font).
 * @internal
 */
function isBase14Font(fontName: string): boolean {
  // Remove subset prefix (e.g., "ABCDEF+Helvetica" -> "Helvetica")
  const cleanName = fontName.replace(/^[A-Z]{6}\+/, '');
  return PDF_BASE_14_FONTS.has(cleanName);
}

/**
 * Checks if a font has a subset prefix, indicating it is embedded.
 * Subset-embedded fonts have a 6-letter uppercase prefix followed by '+'.
 * Example: "KZZGLW+ShinGo-Medium" indicates an embedded subset of ShinGo-Medium.
 * @internal
 */
function hasSubsetPrefix(fontName: string): boolean {
  return /^[A-Z]{6}\+/.test(fontName);
}

/**
 * Detects non-embedded fonts in PDF data.
 *
 * This function analyzes the raw PDF bytes to find font definitions
 * that don't have embedded font data (FontFile, FontFile2, or FontFile3).
 *
 * According to PDF specification:
 * - PDF Base 14 fonts (Helvetica, Times-Roman, Courier, Symbol, ZapfDingbats)
 *   don't require embedding as they are standard fonts.
 * - All other fonts (TrueType, Type0/CIDFont, OpenType) require embedding
 *   for correct rendering, especially in WASM environment.
 *
 * @param pdfData - Raw PDF data as Uint8Array
 * @returns Array of font names that are not embedded (excluding Base 14 fonts)
 * @internal
 */
function detectNonEmbeddedFonts(pdfData: Uint8Array): string[] {
  const nonEmbeddedFonts: string[] = [];

  try {
    // Convert to string for regex matching (only works for ASCII parts)
    const pdfString = new TextDecoder('latin1').decode(pdfData);

    // Find all font types that require embedding:
    // - CIDFontType0, CIDFontType2 (CJK and other complex scripts)
    // - TrueType
    // - Type0 (composite fonts)
    const requiresEmbeddingPattern = /\/Subtype\s*\/(CIDFontType[02]|TrueType|Type0|OpenType)/g;
    const hasNonStandardFonts = requiresEmbeddingPattern.test(pdfString);

    if (!hasNonStandardFonts) {
      return nonEmbeddedFonts;
    }

    // Find all font base font names
    const baseFontPattern = /\/BaseFont\s*\/([^\s/>]+)/g;
    let match: RegExpExecArray | null;
    const allBaseFonts: string[] = [];

    // biome-ignore lint/suspicious/noAssignInExpressions: Standard regex exec pattern
    while ((match = baseFontPattern.exec(pdfString)) !== null) {
      if (match[1]) {
        allBaseFonts.push(match[1]);
      }
    }

    // Filter out Base 14 fonts and fonts with subset prefixes (which are embedded)
    // Subset-prefixed fonts (e.g., "KZZGLW+ShinGo-Medium") are always embedded,
    // as the prefix is added when subsetting/embedding the font.
    const nonEmbeddedCandidates = allBaseFonts.filter(
      (name) => !(isBase14Font(name) || hasSubsetPrefix(name)),
    );

    // Non-embedded fonts are those that:
    // 1. Are not Base 14 fonts (standard fonts that don't need embedding)
    // 2. Don't have subset prefixes (which indicate embedding)
    nonEmbeddedFonts.push(...nonEmbeddedCandidates);
  } catch {
    // If parsing fails, don't throw - just return empty array
    // The rendering will proceed and may show other errors
  }

  return [...new Set(nonEmbeddedFonts)]; // Remove duplicates
}

/**
 * Gets or initializes the PDFium library instance.
 *
 * @returns Promise resolving to the PDFium library instance
 * @internal
 */
async function getLibrary(): Promise<PDFiumLibrary> {
  if (!libraryInstance) {
    libraryInstance = await PDFiumLibrary.init();
  }
  return libraryInstance;
}

/**
 * Internal implementation of the {@link PdfDocument} interface.
 *
 * This class wraps PDFium's document handling and provides a
 * simpler, memory-efficient API for rendering PDF pages to images.
 *
 * @internal This class is not part of the public API. Use {@link openPdf} instead.
 */
export class PdfDocumentImpl implements PdfDocument {
  /**
   * The underlying PDFium document.
   * @internal
   */
  private document: PDFiumDocument;

  /**
   * Raw PDF data for font detection.
   * @internal
   */
  private pdfData: Uint8Array;

  /**
   * Whether the document has been closed.
   * @internal
   */
  private closed = false;

  /**
   * Cached non-embedded font detection result.
   * @internal
   */
  private nonEmbeddedFontsChecked = false;
  private nonEmbeddedFonts: string[] = [];

  /**
   * Creates a new PdfDocumentImpl instance.
   *
   * @param document - The PDFium document
   * @param pdfData - Raw PDF data for font detection
   * @internal
   */
  private constructor(document: PDFiumDocument, pdfData: Uint8Array) {
    this.document = document;
    this.pdfData = pdfData;
  }

  /**
   * Opens a PDF document from various input sources.
   *
   * This is the factory method for creating PdfDocumentImpl instances.
   * It handles input resolution and error wrapping.
   *
   * @param input - File path, Buffer, Uint8Array, or ArrayBuffer
   * @param options - Options for opening the PDF
   * @returns Promise resolving to a new PdfDocumentImpl instance
   * @throws {@link PdfError} if the PDF cannot be opened
   *
   * @internal Use {@link openPdf} from the public API instead.
   */
  public static async open(
    input: PdfInput,
    options: PdfOpenOptions = {},
  ): Promise<PdfDocumentImpl> {
    const data = await resolveInput(input);
    const library = await getLibrary();

    try {
      const document = library.loadDocument(data, options.password);
      return new PdfDocumentImpl(document, data);
    } catch (error) {
      throw wrapPdfiumError(error);
    }
  }

  /**
   * Gets the total number of pages in the document.
   *
   * @returns The number of pages
   * @throws {@link PdfError} with code `DOCUMENT_CLOSED` if the document has been closed
   */
  public get pageCount(): number {
    this.ensureOpen();
    return this.document.getPageCount();
  }

  /**
   * Renders pages as images using an async generator.
   *
   * This method is memory-efficient as it processes one page at a time,
   * yielding each rendered page before moving to the next.
   *
   * @param options - Rendering options (scale, format, quality, pages)
   * @returns Async generator yielding {@link RenderedPage} for each page
   * @throws {@link PdfError} with code `DOCUMENT_CLOSED` if the document has been closed
   * @throws {@link PdfError} with code `INVALID_PAGE_NUMBER` if any specified page is out of range
   * @throws {@link PdfError} with code `RENDER_FAILED` if rendering fails
   */
  public async *renderPages(
    options: RenderOptions = {},
  ): AsyncGenerator<RenderedPage, void, unknown> {
    this.ensureOpen();

    const pageNumbers = this.resolvePageNumbers(options.pages);

    for (const pageNumber of pageNumbers) {
      yield await this.renderPageInternal(pageNumber, options);
    }
  }

  /**
   * Renders a single page to an image.
   *
   * @param pageNumber - Page number to render (1-indexed)
   * @param options - Rendering options (scale, format, quality)
   * @returns Promise resolving to the rendered page
   * @throws {@link PdfError} with code `DOCUMENT_CLOSED` if the document has been closed
   * @throws {@link PdfError} with code `INVALID_PAGE_NUMBER` if page number is out of range
   * @throws {@link PdfError} with code `RENDER_FAILED` if rendering fails
   */
  public async renderPage(
    pageNumber: number,
    options: Omit<RenderOptions, 'pages'> = {},
  ): Promise<RenderedPage> {
    this.ensureOpen();

    if (pageNumber < 1 || pageNumber > this.pageCount) {
      throw new PdfError(
        `Invalid page number: ${pageNumber}. Document has ${this.pageCount} pages.`,
        'INVALID_PAGE_NUMBER',
      );
    }

    return await this.renderPageInternal(pageNumber, options);
  }

  /**
   * Closes the document and releases all resources.
   *
   * This method is idempotent - calling it multiple times is safe.
   * After calling this method, the document cannot be used anymore.
   */
  // biome-ignore lint/suspicious/useAwait: Interface requires Promise<void> for consistency
  public async close(): Promise<void> {
    if (this.closed) {
      return;
    }

    this.closed = true;
    this.document.destroy();
  }

  /**
   * Implements the AsyncDisposable interface for use with `await using`.
   *
   * This method is called automatically when the document goes out of scope
   * when using the `await using` syntax (ES2024).
   *
   * @internal
   */
  public async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }

  /**
   * Ensures the document is still open.
   *
   * @throws {@link PdfError} with code `DOCUMENT_CLOSED` if the document has been closed
   * @internal
   */
  private ensureOpen(): void {
    if (this.closed) {
      throw new PdfError('Document has been closed', 'DOCUMENT_CLOSED');
    }
  }

  /**
   * Resolves the pages option to an array of page numbers.
   *
   * @param pages - Page specification (array, range, or undefined for all)
   * @returns Array of page numbers to render
   * @throws {@link PdfError} with code `INVALID_PAGE_NUMBER` if any page is out of range
   * @internal
   */
  private resolvePageNumbers(pages?: number[] | PageRange): number[] {
    if (!pages) {
      // All pages
      return Array.from({ length: this.pageCount }, (_, i) => i + 1);
    }

    if (Array.isArray(pages)) {
      // Validate page numbers
      for (const p of pages) {
        if (p < 1 || p > this.pageCount) {
          throw new PdfError(
            `Invalid page number: ${p}. Document has ${this.pageCount} pages.`,
            'INVALID_PAGE_NUMBER',
          );
        }
      }
      return pages;
    }

    // PageRange
    const start = pages.start ?? 1;
    const end = pages.end ?? this.pageCount;

    if (start < 1 || start > this.pageCount) {
      throw new PdfError(
        `Invalid start page: ${start}. Document has ${this.pageCount} pages.`,
        'INVALID_PAGE_NUMBER',
      );
    }

    if (end < start || end > this.pageCount) {
      throw new PdfError(
        `Invalid end page: ${end}. Document has ${this.pageCount} pages.`,
        'INVALID_PAGE_NUMBER',
      );
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /**
   * Checks for non-embedded fonts and throws an error if found.
   *
   * This method is called before rendering to detect PDFs that will not
   * render correctly due to missing font data.
   *
   * @throws {@link PdfError} with code `MISSING_FONT` if non-embedded fonts are detected
   * @internal
   */
  private checkForNonEmbeddedFonts(): void {
    if (!this.nonEmbeddedFontsChecked) {
      this.nonEmbeddedFonts = detectNonEmbeddedFonts(this.pdfData);
      this.nonEmbeddedFontsChecked = true;
    }

    if (this.nonEmbeddedFonts.length > 0) {
      throw new PdfError(
        `PDF contains fonts without embedded font data: ${this.nonEmbeddedFonts.join(', ')}. ` +
          'Non-standard fonts (other than PDF Base 14 fonts) require embedding for correct rendering. ' +
          'Please use a PDF with embedded fonts.',
        'MISSING_FONT',
      );
    }
  }

  /**
   * Internal method to render a single page.
   *
   * This method handles the actual rendering using PDFium and sharp.
   * It renders the page to raw bitmap and converts it to an image buffer.
   *
   * @param pageNumber - Page number to render (1-indexed, already validated)
   * @param options - Rendering options
   * @returns Promise resolving to the rendered page
   * @throws {@link PdfError} with code `RENDER_FAILED` if rendering fails
   * @throws {@link PdfError} with code `MISSING_FONT` if non-embedded fonts are detected
   * @internal
   */
  private async renderPageInternal(
    pageNumber: number,
    options: Omit<RenderOptions, 'pages'>,
  ): Promise<RenderedPage> {
    // Check for non-embedded CJK fonts before rendering
    this.checkForNonEmbeddedFonts();

    const scale = options.scale ?? DEFAULT_RENDER_OPTIONS.scale;
    const format = options.format ?? DEFAULT_RENDER_OPTIONS.format;
    const quality = options.quality ?? DEFAULT_RENDER_OPTIONS.quality;

    try {
      // PDFium uses 0-indexed pages
      // Note: PDFiumPage objects don't have explicit cleanup methods.
      // Memory is managed internally and released when PDFiumDocument.destroy() is called.
      const page = this.document.getPage(pageNumber - 1);

      // Render to raw BGRA bitmap (PDFium native format)
      const image = page.render({ render: 'bitmap', scale });
      const { data, width, height } = image;

      // Convert BGRA to RGBA (swap red and blue channels)
      const rgbaData = convertBgraToRgba(data);

      // Convert raw RGBA to image format using sharp
      const sharpInstance = sharp(Buffer.from(rgbaData), {
        raw: {
          width,
          height,
          channels: 4,
        },
      });

      let buffer: Buffer;
      if (format === 'jpeg') {
        buffer = await sharpInstance.jpeg({ quality: Math.round(quality * 100) }).toBuffer();
      } else {
        buffer = await sharpInstance.png().toBuffer();
      }

      return {
        pageNumber,
        totalPages: this.pageCount,
        buffer,
        width,
        height,
      };
    } catch (error) {
      throw new PdfError(
        `Failed to render page ${pageNumber}: ${error instanceof Error ? error.message : String(error)}`,
        'RENDER_FAILED',
        error,
      );
    }
  }
}

/**
 * Resolves various input types to a Uint8Array suitable for PDFium.
 *
 * This function handles:
 * - File paths (reads the file from disk)
 * - Node.js Buffers (converts to Uint8Array)
 * - Uint8Array (returns as-is)
 * - ArrayBuffer (wraps in Uint8Array)
 *
 * @param input - The PDF input (file path or binary data)
 * @returns Promise resolving to a Uint8Array of PDF data
 * @throws {@link PdfError} with code `FILE_NOT_FOUND` if the file doesn't exist
 * @throws {@link PdfError} with code `INVALID_INPUT` if the input type is unsupported
 *
 * @internal
 */
async function resolveInput(input: PdfInput): Promise<Uint8Array> {
  if (typeof input === 'string') {
    // File path
    try {
      const buffer = await fs.readFile(input);
      return new Uint8Array(buffer);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new PdfError(`File not found: ${input}`, 'FILE_NOT_FOUND', error);
      }
      throw new PdfError(`Failed to read file: ${input}`, 'INVALID_INPUT', error);
    }
  }

  if (input instanceof Buffer) {
    return new Uint8Array(input);
  }

  if (input instanceof Uint8Array) {
    return input;
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  throw new PdfError('Invalid input type', 'INVALID_INPUT');
}

/**
 * Converts PDFium errors to {@link PdfError} instances.
 *
 * This function analyzes error messages to determine the appropriate
 * error code and creates a consistent error format.
 *
 * @param error - The error thrown by PDFium
 * @returns A PdfError with the appropriate code
 *
 * @internal
 */
function wrapPdfiumError(error: unknown): PdfError {
  if (error instanceof PdfError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  // Detect specific error types
  if (
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('not a pdf') ||
    lowerMessage.includes('format')
  ) {
    return new PdfError('Invalid PDF file', 'INVALID_PDF', error);
  }

  if (lowerMessage.includes('password')) {
    if (lowerMessage.includes('incorrect') || lowerMessage.includes('wrong')) {
      return new PdfError('Incorrect password', 'INVALID_PASSWORD', error);
    }
    return new PdfError('Password required to open this PDF', 'PASSWORD_REQUIRED', error);
  }

  return new PdfError(message, 'UNKNOWN', error);
}
