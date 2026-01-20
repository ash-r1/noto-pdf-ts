/**
 * PDFium Lite WASM loader.
 *
 * This module loads the PDFium WASM without any fonts.
 * Use registerFonts() to add fonts manually if needed.
 *
 * @module pdfium/wasm-lite
 */

import type { LoadPdfiumOptions, PDFiumModule } from './types.js';
import loadPdfiumModule from './wasm/pdfium.js';

/**
 * Cached WASM module promise.
 *
 * The WASM binary is large (~20MB) and PDFium uses global state internally.
 * Caching ensures we only load once per process, avoiding memory issues
 * when creating multiple NotoPdf instances.
 */
let cachedModulePromise: Promise<PDFiumModule> | null = null;

/**
 * Whether the PDFium library has been initialized on the cached module.
 */
let libraryInitialized = false;

/**
 * Reference count for active PDFiumLibrary instances.
 */
let referenceCount = 0;

/**
 * Loads the PDFium Lite WASM module.
 *
 * The lite variant does not include any fonts.
 * For CJK font support, use registerFonts() to add fonts manually.
 *
 * The module is cached internally to avoid loading the ~20MB WASM binary
 * multiple times. Multiple NotoPdf instances share the same WASM module.
 *
 * @param options - Optional configuration
 * @returns Promise resolving to the PDFium module
 */
export function loadPdfiumLite(options?: LoadPdfiumOptions): Promise<PDFiumModule> {
  if (!cachedModulePromise) {
    cachedModulePromise = loadPdfiumModule(options);
  }
  return cachedModulePromise;
}

/**
 * Checks if the PDFium library has been initialized.
 * @internal
 */
export function isLibraryInitialized(): boolean {
  return libraryInitialized;
}

/**
 * Marks the PDFium library as initialized.
 * @internal
 */
export function markLibraryInitialized(): void {
  libraryInitialized = true;
}

/**
 * Increments the reference count.
 * @internal
 */
export function incrementRefCount(): void {
  referenceCount++;
}

/**
 * Decrements the reference count and returns whether cleanup should happen.
 * @internal
 */
export function decrementRefCount(): boolean {
  referenceCount--;
  return referenceCount === 0;
}

/**
 * Resets all module-level state.
 * Called when the last reference is released.
 * @internal
 */
export function resetModuleState(): void {
  cachedModulePromise = null;
  libraryInitialized = false;
  referenceCount = 0;
}
