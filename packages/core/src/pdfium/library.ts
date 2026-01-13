/**
 * PDFium library wrapper.
 *
 * This module provides the core PDFium library management,
 * including initialization with different variants (full/lite).
 *
 * @module pdfium/library
 */

import { DEFAULT_FONT_DIR, PDFIUM_FONT_PATHS, registerFonts } from './fonts.js';
import type { FontConfig, PDFiumModule } from './types.js';
import { FPDFBitmap, FPDFErrorCode } from './types.js';
import { lengthBytesUTF8, stringToUTF8 } from './wasm-utils.js';

/**
 * Bytes per pixel for BGRA format.
 */
const BYTES_PER_PIXEL = 4;

/**
 * Type for WASM loader function.
 */
type LoadPdfiumFn = (options?: { locateFile?: (path: string) => string }) => Promise<PDFiumModule>;

/**
 * PDFium library instance.
 *
 * Manages the lifecycle of the PDFium WASM module and provides
 * document loading capabilities.
 */
export class PDFiumLibrary {
  private readonly module: PDFiumModule;
  private initialized = false;
  /** Pointers to font path strings that need to be freed on destroy */
  private fontPathPtrs: number[] = [];

  private constructor(module: PDFiumModule) {
    this.module = module;
  }

  /**
   * Gets the underlying PDFium module.
   * Use with caution - this is for advanced use cases like font registration.
   */
  public getModule(): PDFiumModule {
    return this.module;
  }

  /**
   * Initializes the PDFium library.
   *
   * The core library does not include embedded fonts. Use font packages
   * (e.g., @noto-pdf-ts/fonts-jp) and `registerFonts()` to add fonts
   * manually if needed for rendering PDFs without embedded fonts.
   *
   * @returns Promise resolving to a PDFiumLibrary instance
   *
   * @example
   * ```typescript
   * import { PDFiumLibrary } from '@noto-pdf-ts/core'
   * import loadFontJp from '@noto-pdf-ts/fonts-jp'
   *
   * const library = await PDFiumLibrary.init()
   * library.registerFonts([await loadFontJp()])
   * ```
   */
  public static async init(): Promise<PDFiumLibrary> {
    // Dynamic import of lite variant WASM loader
    const { loadPdfiumLite } = await import('./wasm-lite.js');
    return PDFiumLibrary.initWithLoader(loadPdfiumLite);
  }

  /**
   * Initializes the library with a custom WASM loader.
   *
   * @param loadPdfium - Function to load the PDFium WASM module
   * @returns Promise resolving to a PDFiumLibrary instance
   */
  private static async initWithLoader(loadPdfium: LoadPdfiumFn): Promise<PDFiumLibrary> {
    const module = await loadPdfium();
    const library = new PDFiumLibrary(module);
    library.initLibraryConfig();
    return library;
  }

  /**
   * Registers fonts in the library's virtual filesystem.
   *
   * This is primarily useful for the lite variant where fonts
   * are not embedded.
   *
   * @param fonts - Array of font configurations
   * @param directory - Directory to place fonts (default: /fonts)
   */
  public registerFonts(fonts: FontConfig[], directory: string = DEFAULT_FONT_DIR): void {
    registerFonts(this.module, fonts, directory);
  }

  /**
   * Initializes the PDFium library with font path configuration.
   */
  private initLibraryConfig(): void {
    if (this.initialized) {
      return;
    }

    const { module } = this;
    const { wasmExports, HEAP32 } = module;

    // FPDF_LIBRARY_CONFIG structure (version 2):
    // struct {
    //   int version;                    // offset 0 (4 bytes)
    //   const char** m_pUserFontPaths;  // offset 4 (4 bytes on 32-bit)
    //   void* m_pIsolate;               // offset 8
    //   unsigned int m_v8EmbedderSlot;  // offset 12
    //   void* m_pPlatform;              // offset 16
    //   void* m_RendererType;           // offset 20
    // }
    const CONFIG_SIZE = 24;
    const configPtr = wasmExports.malloc(CONFIG_SIZE);

    // Zero-initialize the config structure
    for (let i = 0; i < CONFIG_SIZE / 4; i++) {
      HEAP32[(configPtr >> 2) + i] = 0;
    }

    // Set version to 2
    HEAP32[configPtr >> 2] = 2;

    // Set font paths
    const fontPathsPtr = this.createFontPathsArray(PDFIUM_FONT_PATHS);
    HEAP32[(configPtr >> 2) + 1] = fontPathsPtr;

    // Initialize library with config
    module._FPDF_InitLibraryWithConfig(configPtr);

    // Free config memory (font paths array is kept for library lifetime)
    wasmExports.free(configPtr);

    this.initialized = true;
  }

  /**
   * Creates a null-terminated array of font path strings in WASM memory.
   *
   * Allocates memory for the array and each string, storing pointers
   * for cleanup in destroy().
   *
   * @param paths - Array of font search paths
   * @returns Pointer to the array
   */
  private createFontPathsArray(paths: string[]): number {
    const { module } = this;
    const { wasmExports, HEAP32 } = module;

    // Allocate array of pointers (paths.length + 1 for null terminator)
    const arrayPtr = wasmExports.malloc((paths.length + 1) * 4);
    this.fontPathPtrs.push(arrayPtr);

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i] as string;
      const pathBytes = lengthBytesUTF8(path) + 1;
      const pathPtr = wasmExports.malloc(pathBytes);
      this.fontPathPtrs.push(pathPtr);
      stringToUTF8(module.HEAPU8, path, pathPtr, pathBytes);
      HEAP32[(arrayPtr >> 2) + i] = pathPtr;
    }

    // Null terminator
    HEAP32[(arrayPtr >> 2) + paths.length] = 0;

    return arrayPtr;
  }

  /**
   * Loads a PDF document.
   *
   * @param data - PDF data as Uint8Array
   * @param password - Optional password for encrypted PDFs
   * @returns Promise resolving to a PDFiumDocument
   */
  public loadDocument(data: Uint8Array, password?: string): PDFiumDocument {
    const { module } = this;
    const { wasmExports } = module;

    // Allocate memory for PDF data
    const dataPtr = wasmExports.malloc(data.length);
    // Access HEAPU8 fresh after malloc as memory may have grown
    module.HEAPU8.set(data, dataPtr);

    // Allocate memory for password if provided
    let passwordPtr = 0;
    if (password) {
      const passwordBytes = lengthBytesUTF8(password) + 1;
      passwordPtr = wasmExports.malloc(passwordBytes);
      stringToUTF8(module.HEAPU8, password, passwordPtr, passwordBytes);
    }

    // Load document
    const docPtr = module._FPDF_LoadMemDocument(dataPtr, data.length, passwordPtr);

    // Free password memory
    if (passwordPtr) {
      wasmExports.free(passwordPtr);
    }

    // Check for errors
    if (!docPtr) {
      wasmExports.free(dataPtr);
      const error = module._FPDF_GetLastError();
      throw this.createError(error);
    }

    return new PDFiumDocument(module, docPtr, dataPtr);
  }

  /**
   * Creates an error from a PDFium error code.
   */
  private createError(code: number): Error {
    const messages: Record<number, string> = {
      [FPDFErrorCode.SUCCESS]: 'Success',
      [FPDFErrorCode.UNKNOWN]: 'Unknown error',
      [FPDFErrorCode.FILE]: 'File not found or could not be opened',
      [FPDFErrorCode.FORMAT]: 'File not in PDF format or corrupted',
      [FPDFErrorCode.PASSWORD]: 'Password required or incorrect password',
      [FPDFErrorCode.SECURITY]: 'Unsupported security scheme',
      [FPDFErrorCode.PAGE]: 'Page not found or content error',
    };
    return new Error(messages[code] || `PDFium error: ${code}`);
  }

  /**
   * Destroys the library and frees resources.
   */
  public destroy(): void {
    if (this.initialized && this.module) {
      this.module._FPDF_DestroyLibrary();

      // Free font path memory allocated in createFontPathsArray
      const { wasmExports } = this.module;
      for (const ptr of this.fontPathPtrs) {
        wasmExports.free(ptr);
      }
      this.fontPathPtrs = [];

      this.initialized = false;
    }
  }
}

/**
 * PDFium document wrapper.
 */
export class PDFiumDocument {
  private readonly module: PDFiumModule;
  private readonly docPtr: number;
  private readonly dataPtr: number;
  private destroyed = false;

  public constructor(module: PDFiumModule, docPtr: number, dataPtr: number) {
    this.module = module;
    this.docPtr = docPtr;
    this.dataPtr = dataPtr;
  }

  /**
   * Gets the number of pages in the document.
   */
  public getPageCount(): number {
    return this.module._FPDF_GetPageCount(this.docPtr);
  }

  /**
   * Gets a page from the document.
   *
   * @param pageIndex - Zero-based page index
   * @returns PDFiumPage instance
   */
  public getPage(pageIndex: number): PDFiumPage {
    const pagePtr = this.module._FPDF_LoadPage(this.docPtr, pageIndex);
    if (!pagePtr) {
      throw new Error(`Failed to load page ${pageIndex}`);
    }
    return new PDFiumPage(this.module, pagePtr);
  }

  /**
   * Destroys the document and frees resources.
   */
  public destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    this.module._FPDF_CloseDocument(this.docPtr);
    if (this.dataPtr) {
      this.module.wasmExports.free(this.dataPtr);
    }
  }
}

/**
 * Rendered image data.
 */
export interface RenderedImage {
  data: Uint8Array;
  width: number;
  height: number;
}

/**
 * Render options.
 */
export interface RenderOptions {
  scale?: number;
  render?: 'bitmap';
  ignoreMissingGlyphs?: boolean;
  missingGlyphThreshold?: number;
}

/**
 * Result of missing glyph check.
 */
interface MissingGlyphCheckResult {
  hasMissingGlyphs: boolean;
  missingCount: number;
}

/**
 * PDFium page wrapper.
 */
export class PDFiumPage {
  private readonly module: PDFiumModule;
  private readonly pagePtr: number;

  public constructor(module: PDFiumModule, pagePtr: number) {
    this.module = module;
    this.pagePtr = pagePtr;
  }

  /**
   * Gets the width of the page in points.
   */
  public get width(): number {
    return this.module._FPDF_GetPageWidth(this.pagePtr);
  }

  /**
   * Gets the height of the page in points.
   */
  public get height(): number {
    return this.module._FPDF_GetPageHeight(this.pagePtr);
  }

  /**
   * Renders the page to a bitmap.
   *
   * @param options - Render options
   * @returns Rendered image data
   */
  public render(options: RenderOptions = {}): RenderedImage {
    const scale = options.scale ?? 1;
    const ignoreMissingGlyphs = options.ignoreMissingGlyphs ?? false;
    const missingGlyphThreshold = options.missingGlyphThreshold ?? 0;

    const width = Math.ceil(this.width * scale);
    const height = Math.ceil(this.height * scale);
    const stride = width * BYTES_PER_PIXEL;
    const bufferSize = stride * height;

    const { module } = this;
    const { wasmExports } = module;

    // Allocate buffer
    const bufferPtr = wasmExports.malloc(bufferSize);

    // Create bitmap
    const bitmap = module._FPDFBitmap_CreateEx(width, height, FPDFBitmap.BGRA, bufferPtr, stride);

    // Fill with white background
    module._FPDFBitmap_FillRect(bitmap, 0, 0, width, height, 0xffffffff);

    // Render page
    module._FPDF_RenderPageBitmap(
      bitmap,
      this.pagePtr,
      0,
      0,
      width,
      height,
      0, // rotation
      0, // flags
    );

    // Copy data - access HEAPU8 fresh here as WASM memory may have grown during rendering
    const data = new Uint8Array(bufferSize);
    data.set(module.HEAPU8.subarray(bufferPtr, bufferPtr + bufferSize));

    // Cleanup
    module._FPDFBitmap_Destroy(bitmap);
    wasmExports.free(bufferPtr);

    // Check for missing glyphs after rendering (for minimal performance impact)
    if (!ignoreMissingGlyphs) {
      const glyphCheck = this.checkMissingGlyphs();
      if (glyphCheck.hasMissingGlyphs && glyphCheck.missingCount > missingGlyphThreshold) {
        throw new Error(
          `Missing glyphs detected: ${glyphCheck.missingCount} character(s) could not be rendered`,
        );
      }
    }

    return { data, width, height };
  }

  /**
   * Closes the page and frees resources.
   */
  public close(): void {
    this.module._FPDF_ClosePage(this.pagePtr);
  }

  /**
   * Checks for missing glyphs (characters with invalid Unicode mapping).
   *
   * Uses FPDFText_HasUnicodeMapError to detect characters that cannot
   * be properly rendered due to missing font information.
   *
   * @returns Check result with missing glyph count
   * @internal
   */
  private checkMissingGlyphs(): MissingGlyphCheckResult {
    const { module, pagePtr } = this;

    // Load text page for character analysis
    const textPagePtr = module._FPDFText_LoadPage(pagePtr);
    if (!textPagePtr) {
      // If text page cannot be loaded, assume no text content
      return { hasMissingGlyphs: false, missingCount: 0 };
    }

    try {
      const charCount = module._FPDFText_CountChars(textPagePtr);
      let missingCount = 0;

      for (let i = 0; i < charCount; i++) {
        // Returns 1 if character has invalid Unicode mapping
        if (module._FPDFText_HasUnicodeMapError(textPagePtr, i) === 1) {
          missingCount++;
        }
      }

      return {
        hasMissingGlyphs: missingCount > 0,
        missingCount,
      };
    } finally {
      module._FPDFText_ClosePage(textPagePtr);
    }
  }
}
