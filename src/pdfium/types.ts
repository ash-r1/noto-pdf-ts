/**
 * PDFium WASM module types.
 *
 * @module pdfium/types
 */

/**
 * Emscripten virtual filesystem interface.
 * Used for loading fonts into the WASM environment.
 */
export interface EmscriptenFS {
  mkdir(path: string): void;
  writeFile(path: string, data: Uint8Array | string): void;
  readFile(path: string, opts?: { encoding?: string }): Uint8Array | string;
  unlink(path: string): void;
  rmdir(path: string): void;
  readdir(path: string): string[];
  stat(path: string): { mode: number };
  isDir(mode: number): boolean;
  isFile(mode: number): boolean;
}

/**
 * Low-level PDFium WASM module interface.
 * Method names match the PDFium C API exactly.
 */
export interface PDFiumModule {
  // Memory access
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;

  // Virtual filesystem (for font loading)
  FS: EmscriptenFS;

  // WASM exports for memory management
  wasmExports: {
    malloc(size: number): number;
    free(ptr: number): void;
  };

  // Library initialization
  _PDFium_Init(): void;
  _FPDF_InitLibrary(): void;
  _FPDF_InitLibraryWithConfig(config: number): void;
  _FPDF_DestroyLibrary(): void;

  // Document handling
  _FPDF_LoadMemDocument(data: number, size: number, password: number): number;
  _FPDF_CloseDocument(document: number): void;
  _FPDF_GetLastError(): number;
  _FPDF_GetPageCount(document: number): number;

  // Page handling
  _FPDF_LoadPage(document: number, pageIndex: number): number;
  _FPDF_ClosePage(page: number): void;
  _FPDF_GetPageWidth(page: number): number;
  _FPDF_GetPageHeight(page: number): number;

  // Bitmap handling
  _FPDFBitmap_CreateEx(
    width: number,
    height: number,
    format: number,
    buffer: number,
    stride: number,
  ): number;
  _FPDFBitmap_FillRect(
    bitmap: number,
    left: number,
    top: number,
    width: number,
    height: number,
    color: number,
  ): void;
  _FPDF_RenderPageBitmap(
    bitmap: number,
    page: number,
    startX: number,
    startY: number,
    sizeX: number,
    sizeY: number,
    rotate: number,
    flags: number,
  ): void;
  _FPDFBitmap_Destroy(bitmap: number): void;
  _FPDFBitmap_GetBuffer(bitmap: number): number;

  // Text extraction
  _FPDFText_LoadPage(page: number): number;
  _FPDFText_ClosePage(textPage: number): void;
  _FPDFText_CountChars(textPage: number): number;
  _FPDFText_GetText(textPage: number, startIndex: number, count: number, buffer: number): number;

  // Emscripten utilities (optional - may not be exported by all WASM builds)
  setValue?(ptr: number, value: number, type: string): void;
  getValue?(ptr: number, type: string): number;
  UTF8ToString?(ptr: number): string;
  stringToUTF8?(str: string, outPtr: number, maxBytes: number): void;
  lengthBytesUTF8?(str: string): number;
}

/**
 * Options for loading the PDFium WASM module.
 */
export interface LoadPdfiumOptions {
  /** Pre-loaded WASM binary */
  wasmBinary?: ArrayBuffer;
  /** Custom function to locate WASM file */
  locateFile?: (path: string) => string;
}

/**
 * Font configuration for PDFium.
 */
export interface FontConfig {
  /** Font file name (e.g., "NotoSansCJK-Regular.ttc") */
  name: string;
  /** Font data as Uint8Array */
  data: Uint8Array;
}

/**
 * PDFium bitmap format constants.
 */
export const FPDFBitmap = {
  Unknown: 0,
  Gray: 1,
  BGR: 2,
  BGRx: 3,
  BGRA: 4,
} as const;

/**
 * PDFium error codes.
 */
export const FPDFErrorCode = {
  SUCCESS: 0,
  UNKNOWN: 1,
  FILE: 2,
  FORMAT: 3,
  PASSWORD: 4,
  SECURITY: 5,
  PAGE: 6,
} as const;

/**
 * PDFium render flags.
 */
export const FPDFRenderFlag = {
  ANNOT: 0x01,
  LCD_TEXT: 0x02,
  NO_NATIVETEXT: 0x04,
  GRAYSCALE: 0x08,
  RENDER_LIMITEDIMAGECACHE: 0x200,
  RENDER_FORCEHALFTONE: 0x400,
  PRINTING: 0x800,
  RENDER_NO_SMOOTHTEXT: 0x1000,
  RENDER_NO_SMOOTHIMAGE: 0x2000,
  RENDER_NO_SMOOTHPATH: 0x4000,
  REVERSE_BYTE_ORDER: 0x10,
} as const;
