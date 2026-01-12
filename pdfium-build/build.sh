#!/bin/bash
#
# PDFium WASM build script.
#
# Downloads pre-built PDFium WASM from paulocoutinhox/pdfium-lib
# and creates the JS wrapper for ES modules.
#
# Usage:
#   ./build.sh [--output-dir DIR]
#

set -e

# Configuration
PDFIUM_LIB_VERSION="7623"
PDFIUM_LIB_URL="https://github.com/paulocoutinhox/pdfium-lib/releases/download/${PDFIUM_LIB_VERSION}/wasm.tgz"
OUTPUT_DIR="/output"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

WORK_DIR="/tmp/pdfium-wasm-build"

echo "PDFium WASM Build"
echo "================="
echo "Source: paulocoutinhox/pdfium-lib v${PDFIUM_LIB_VERSION}"
echo "Output dir: $OUTPUT_DIR"
echo ""

# Download pre-built WASM
download_pdfium() {
  echo "Downloading PDFium WASM from pdfium-lib..."

  mkdir -p "$WORK_DIR"
  cd "$WORK_DIR"

  curl -L -o wasm.tgz "$PDFIUM_LIB_URL"
  tar -xzf wasm.tgz

  echo "Downloaded and extracted PDFium WASM"
  ls -la "$WORK_DIR"
}

# Create ES module wrapper
create_wrapper() {
  echo "Creating ES module wrapper..."

  mkdir -p "$OUTPUT_DIR"

  # Check what files we have
  echo "Files in WORK_DIR:"
  find "$WORK_DIR" -type f -name "*.js" -o -name "*.wasm" | head -20

  # Find the WASM and JS files
  WASM_FILE=$(find "$WORK_DIR" -name "*.wasm" | head -1)
  JS_FILE=$(find "$WORK_DIR" -name "pdfium.js" -o -name "*.js" | head -1)

  if [ -z "$WASM_FILE" ]; then
    echo "Error: No WASM file found"
    exit 1
  fi

  echo "Found WASM: $WASM_FILE"
  echo "Found JS: $JS_FILE"

  # Copy WASM file
  cp "$WASM_FILE" "$OUTPUT_DIR/pdfium.wasm"

  # If there's already a JS file, use it as base
  if [ -n "$JS_FILE" ] && [ -f "$JS_FILE" ]; then
    # Check if it's already ES module compatible
    if grep -q "export" "$JS_FILE"; then
      cp "$JS_FILE" "$OUTPUT_DIR/pdfium.js"
    else
      # Wrap in ES module
      create_es_wrapper "$JS_FILE"
    fi
  else
    # Create minimal ES module wrapper
    create_minimal_wrapper
  fi
}

# Create ES module wrapper from existing JS
create_es_wrapper() {
  local SOURCE_JS="$1"

  cat > "$OUTPUT_DIR/pdfium.js" << 'WRAPPER_START'
// PDFium WASM ES Module Wrapper
// Based on paulocoutinhox/pdfium-lib

WRAPPER_START

  cat "$SOURCE_JS" >> "$OUTPUT_DIR/pdfium.js"

  # Add ES module export if not present
  if ! grep -q "export default" "$OUTPUT_DIR/pdfium.js"; then
    echo "" >> "$OUTPUT_DIR/pdfium.js"
    echo "export default loadPdfium;" >> "$OUTPUT_DIR/pdfium.js"
  fi
}

# Create minimal ES module wrapper
create_minimal_wrapper() {
  cat > "$OUTPUT_DIR/pdfium.js" << 'EOF'
// PDFium WASM ES Module Wrapper
// Based on paulocoutinhox/pdfium-lib

var loadPdfium = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return function(moduleArg = {}) {
    var Module = moduleArg;

    Module.locateFile = Module.locateFile || function(path) {
      if (path.endsWith('.wasm')) {
        if (typeof _scriptDir !== 'undefined') {
          return _scriptDir.replace(/\.js$/, '.wasm');
        }
        return 'pdfium.wasm';
      }
      return path;
    };

    return new Promise((resolve, reject) => {
      // This is a placeholder - the actual pdfium-lib JS handles this
      reject(new Error('PDFium WASM wrapper needs the actual pdfium-lib JS file'));
    });
  };
})();

export default loadPdfium;
EOF
}

# Create TypeScript types
create_types() {
  echo "Creating TypeScript types..."

  cat > "$OUTPUT_DIR/pdfium.d.ts" << 'EOF'
/**
 * PDFium WASM module types.
 * Based on paulocoutinhox/pdfium-lib
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

export interface PDFiumModule {
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  FS: EmscriptenFS;
  wasmExports: {
    malloc(size: number): number;
    free(ptr: number): void;
  };
  _PDFium_Init(): void;
  _FPDF_InitLibrary(): void;
  _FPDF_InitLibraryWithConfig(config: number): void;
  _FPDF_DestroyLibrary(): void;
  _FPDF_LoadMemDocument(data: number, size: number, password: number): number;
  _FPDF_CloseDocument(document: number): void;
  _FPDF_GetLastError(): number;
  _FPDF_GetPageCount(document: number): number;
  _FPDF_LoadPage(document: number, pageIndex: number): number;
  _FPDF_ClosePage(page: number): void;
  _FPDF_GetPageWidth(page: number): number;
  _FPDF_GetPageHeight(page: number): number;
  _FPDFBitmap_CreateEx(
    width: number,
    height: number,
    format: number,
    buffer: number,
    stride: number
  ): number;
  _FPDFBitmap_FillRect(
    bitmap: number,
    left: number,
    top: number,
    width: number,
    height: number,
    color: number
  ): void;
  _FPDF_RenderPageBitmap(
    bitmap: number,
    page: number,
    startX: number,
    startY: number,
    sizeX: number,
    sizeY: number,
    rotate: number,
    flags: number
  ): void;
  _FPDFBitmap_Destroy(bitmap: number): void;
  _FPDFBitmap_GetBuffer(bitmap: number): number;
  _FPDFText_LoadPage(page: number): number;
  _FPDFText_ClosePage(textPage: number): void;
  _FPDFText_CountChars(textPage: number): number;
  _FPDFText_GetText(
    textPage: number,
    startIndex: number,
    count: number,
    buffer: number
  ): number;
  ccall(
    ident: string,
    returnType: string | null,
    argTypes: string[],
    args: unknown[]
  ): unknown;
  cwrap(
    ident: string,
    returnType: string | null,
    argTypes: string[]
  ): (...args: unknown[]) => unknown;
  setValue(ptr: number, value: number, type: string): void;
  getValue(ptr: number, type: string): number;
  UTF8ToString(ptr: number): string;
  stringToUTF8(str: string, outPtr: number, maxBytes: number): void;
  lengthBytesUTF8(str: string): number;
}

export interface LoadPdfiumOptions {
  wasmBinary?: ArrayBuffer;
  locateFile?: (path: string) => string;
  instantiateWasm?: (
    imports: WebAssembly.Imports,
    successCallback: (module: WebAssembly.Instance) => void
  ) => WebAssembly.Exports;
}

declare function loadPdfium(
  options?: LoadPdfiumOptions
): Promise<PDFiumModule>;

export default loadPdfium;
EOF

  echo "TypeScript types created: $OUTPUT_DIR/pdfium.d.ts"
}

# Main
main() {
  download_pdfium
  create_wrapper
  create_types

  echo ""
  echo "Build complete!"
  echo "Output files:"
  ls -lh "$OUTPUT_DIR"
}

main
