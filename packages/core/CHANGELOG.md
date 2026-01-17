# @noto-pdf-ts/core

## 0.0.1-alpha.1

### Patch Changes

- [#34](https://github.com/ash-r1/noto-pdf-ts/pull/34) [`7e53f8e`](https://github.com/ash-r1/noto-pdf-ts/commit/7e53f8e9e1ac93cd219404d3aec6fcf572ab23c9) Thanks [@ash-r1](https://github.com/ash-r1)! - Fix WASM file path resolution for npm package users

  The bundled code resolves the WASM file relative to `import.meta.url`, but the file was being copied to the wrong location (`dist/pdfium/wasm/` instead of `dist/`), causing ENOENT errors at runtime.
