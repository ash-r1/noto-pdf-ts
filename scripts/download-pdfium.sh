#!/bin/bash
#
# Download pre-built PDFium WASM from paulocoutinhox/pdfium-lib
#
# Usage:
#   ./scripts/download-pdfium.sh
#

set -e

PDFIUM_LIB_VERSION="7623"
PDFIUM_LIB_URL="https://github.com/paulocoutinhox/pdfium-lib/releases/download/${PDFIUM_LIB_VERSION}/wasm.tgz"
OUTPUT_DIR="src/pdfium/wasm"

echo "Downloading PDFium WASM v${PDFIUM_LIB_VERSION}..."

WORK_DIR=$(mktemp -d)
trap "rm -rf $WORK_DIR" EXIT

curl -L -o "$WORK_DIR/wasm.tgz" "$PDFIUM_LIB_URL"
tar -xzf "$WORK_DIR/wasm.tgz" -C "$WORK_DIR"

# Use ESM version
cp "$WORK_DIR/release/node/pdfium.esm.js" "$OUTPUT_DIR/pdfium.js"
cp "$WORK_DIR/release/node/pdfium.esm.wasm" "$OUTPUT_DIR/pdfium.wasm"

echo "Done. Files saved to $OUTPUT_DIR/"
ls -lh "$OUTPUT_DIR/pdfium.js" "$OUTPUT_DIR/pdfium.wasm"
