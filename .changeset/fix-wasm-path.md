---
"@noto-pdf-ts/core": patch
---

Fix WASM file path resolution for npm package users

The bundled code resolves the WASM file relative to `import.meta.url`, but the file was being copied to the wrong location (`dist/pdfium/wasm/` instead of `dist/`), causing ENOENT errors at runtime.
