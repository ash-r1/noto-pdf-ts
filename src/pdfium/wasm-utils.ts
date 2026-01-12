/**
 * WASM utility functions for string operations.
 *
 * These provide equivalents to Emscripten's UTF8 functions
 * for WASM builds that don't export them.
 *
 * @module pdfium/wasm-utils
 */

const encoder: TextEncoder = new TextEncoder();

/**
 * Returns the number of bytes needed to store a UTF8 string (excluding null terminator).
 *
 * @param str - The string to measure
 * @returns Number of bytes needed
 */
export function lengthBytesUTF8(str: string): number {
  return encoder.encode(str).length;
}

/**
 * Writes a UTF8 string to WASM memory with null terminator.
 *
 * @param heap - The WASM HEAPU8 array
 * @param str - The string to write
 * @param outPtr - Pointer to write location
 * @param maxBytes - Maximum bytes to write (including null terminator)
 * @returns Number of bytes written (excluding null terminator)
 */
export function stringToUTF8(
  heap: Uint8Array,
  str: string,
  outPtr: number,
  maxBytes: number,
): number {
  const bytes = encoder.encode(str);
  const bytesToWrite = Math.min(bytes.length, maxBytes - 1); // Leave room for null terminator

  for (let i = 0; i < bytesToWrite; i++) {
    heap[outPtr + i] = bytes[i] as number;
  }

  // Write null terminator
  if (maxBytes > 0) {
    heap[outPtr + bytesToWrite] = 0;
  }

  return bytesToWrite;
}
