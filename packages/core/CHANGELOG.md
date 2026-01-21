# @noto-pdf-ts/core

## 0.1.0-alpha.2

### Minor Changes

- [#42](https://github.com/ash-r1/noto-pdf-ts/pull/42) [`27d6f07`](https://github.com/ash-r1/noto-pdf-ts/commit/27d6f072138d0adeb1428fe26a9928ac35b4d8e0) Thanks [@ash-r1](https://github.com/ash-r1)! - Introduce NotoPdf class with instance-based API

  **Breaking Changes:**

  - Removed global functions: `openPdf()`, `renderPdfPages()`, `getPageCount()`
  - Removed `PdfOpenOptions` type (use `OpenPdfOptions` instead)

  **New API:**

  - `NotoPdf.init({ fonts: [...] })` - Initialize with optional fonts
  - `notoPdf.openPdf(input, options)` - Open PDF documents
  - `notoPdf.registerFonts(fonts)` - Register fonts dynamically
  - `notoPdf.destroy()` - Clean up resources
  - Support for `await using` syntax (AsyncDisposable)

  **Migration:**

  ```typescript
  // Before
  const library = await PDFiumLibrary.init();
  library.registerFonts([await loadFontJp()]);
  const pdf = await openPdf('document.pdf');

  // After
  const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] });
  const pdf = await notoPdf.openPdf('document.pdf');
  ```

## 0.0.1-alpha.1

### Patch Changes

- [#34](https://github.com/ash-r1/noto-pdf-ts/pull/34) [`7e53f8e`](https://github.com/ash-r1/noto-pdf-ts/commit/7e53f8e9e1ac93cd219404d3aec6fcf572ab23c9) Thanks [@ash-r1](https://github.com/ash-r1)! - Fix WASM file path resolution for npm package users

  The bundled code resolves the WASM file relative to `import.meta.url`, but the file was being copied to the wrong location (`dist/pdfium/wasm/` instead of `dist/`), causing ENOENT errors at runtime.
