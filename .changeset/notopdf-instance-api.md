---
"@noto-pdf-ts/core": minor
---

Introduce NotoPdf class with instance-based API

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
const library = await PDFiumLibrary.init()
library.registerFonts([await loadFontJp()])
const pdf = await openPdf('document.pdf')

// After
const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })
const pdf = await notoPdf.openPdf('document.pdf')
```
