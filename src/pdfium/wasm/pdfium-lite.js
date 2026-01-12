/**
 * PDFium Lite WASM loader placeholder.
 *
 * This file will be replaced by the actual Emscripten-generated loader
 * when PDFium WASM is built via GitHub Actions.
 *
 * To build the actual WASM files, run the "Build PDFium WASM" workflow
 * or use Docker locally:
 *   cd pdfium-build && docker build -t pdfium-builder . && docker run -v $(pwd)/../src/pdfium/wasm:/output pdfium-builder
 */

export default function loadPdfiumLite(_options) {
  return Promise.reject(
    new Error(
      'PDFium Lite WASM not yet built. Run the "Build PDFium WASM" GitHub Actions workflow or build locally with Docker.',
    ),
  );
}

export { loadPdfiumLite };
