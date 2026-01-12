/**
 * PDFium WASM module placeholder.
 *
 * This file will be replaced by the actual WASM build from GitHub Actions.
 * Run the "Build PDFium WASM" workflow to generate the real files.
 *
 * @module pdfium/wasm/pdfium
 */

/**
 * Placeholder function that throws an error indicating WASM is not built.
 * @param {Object} _options - Load options (ignored)
 * @returns {Promise<never>} Always rejects
 */
export default function loadPdfium(_options) {
  return Promise.reject(
    new Error(
      'PDFium WASM not yet built. Run the "Build PDFium WASM" GitHub Actions workflow ' +
        'to generate pdfium.js and pdfium.wasm files.',
    ),
  );
}
