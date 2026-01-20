# noto-pdf-ts

[Documentation](https://ash-r1.github.io/noto-pdf-ts/) | [API Reference](https://ash-r1.github.io/noto-pdf-ts/api/)

[日本語版 README](./README_ja.md)

A simple and efficient PDF conversion library for Node.js. Convert PDF pages to images (JPEG/PNG).

## Features

- Simple API - Open PDFs with `openPdf()` and convert to images with `renderPages()`
- Memory efficient - Process one page at a time using AsyncGenerator
- Japanese/CJK font support - Automatic CMap detection from pdfjs-dist
- Full TypeScript support - Includes type definitions
- ESM / CommonJS compatible
- `await using` syntax support (ES2024 AsyncDisposable)

## Installation

> **Note:** This package is currently in alpha. The API may change in future releases.

```bash
# Install the latest alpha version
npm install noto-pdf-ts@alpha
```

### Peer Dependencies

This library requires [sharp](https://github.com/lovell/sharp) as a peer dependency for image processing:

```bash
npm install sharp
```

> **Note:** sharp uses pre-built binaries for most platforms, so no native compilation is typically required.

### Font Packages

For CJK (Chinese, Japanese, Korean) and other language support, install the appropriate font packages:

```bash
# Japanese support
npm install @noto-pdf-ts/fonts-jp@alpha

# Korean support
npm install @noto-pdf-ts/fonts-kr@alpha

# Simplified Chinese support
npm install @noto-pdf-ts/fonts-sc@alpha

# Traditional Chinese support
npm install @noto-pdf-ts/fonts-tc@alpha

# All CJK languages (Japanese, Korean, SC, TC)
npm install @noto-pdf-ts/fonts-cjk@alpha

# All scripts (24 scripts including Latin, Arabic, Hebrew, Indic, etc.)
npm install @noto-pdf-ts/fonts-all@alpha
```

See [Font Packages](#font-packages-1) section below for detailed usage.

## Usage

### Basic Usage

```typescript
import { openPdf } from 'noto-pdf-ts'
import fs from 'node:fs/promises'

// Open a PDF
const pdf = await openPdf('/path/to/document.pdf')
console.log(`Page count: ${pdf.pageCount}`)

// Convert all pages to images
for await (const page of pdf.renderPages({ format: 'jpeg', scale: 1.5 })) {
  console.log(`Converting page ${page.pageNumber}/${page.totalPages}...`)
  await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
}

// Always close when done
await pdf.close()
```

### await using Syntax (ES2024)

```typescript
import { openPdf } from 'noto-pdf-ts'

// Using await using automatically closes the PDF
await using pdf = await openPdf('/path/to/document.pdf')

for await (const page of pdf.renderPages()) {
  // ...
}
// Automatically closed when scope ends
```

### Convenience Functions

```typescript
import { renderPdfPages, getPageCount } from 'noto-pdf-ts'

// Convert all pages in one line (auto-closes)
for await (const page of renderPdfPages('/path/to/document.pdf', { scale: 2 })) {
  await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
}

// Get only the page count
const count = await getPageCount('/path/to/document.pdf')
console.log(`${count} pages`)
```

### Various Input Formats

```typescript
import { openPdf } from 'noto-pdf-ts'

// File path
const pdf1 = await openPdf('/path/to/document.pdf')

// Buffer
const buffer = await fs.readFile('/path/to/document.pdf')
const pdf2 = await openPdf(buffer)

// Uint8Array
const response = await fetch('https://example.com/document.pdf')
const data = new Uint8Array(await response.arrayBuffer())
const pdf3 = await openPdf(data)

// Password-protected PDF
const pdf4 = await openPdf('/path/to/encrypted.pdf', { password: 'secret' })
```

### Converting Specific Pages

```typescript
// Convert a single page
const page = await pdf.renderPage(1)

// Specify page numbers
for await (const page of pdf.renderPages({ pages: [1, 3, 5] })) {
  // Converts only pages 1, 3, 5
}

// Specify page range
for await (const page of pdf.renderPages({ pages: { start: 2, end: 4 } })) {
  // Converts pages 2-4
}
```

### Rendering Options

```typescript
const options = {
  scale: 2.0,      // Scale factor (default: 1.5)
  format: 'png',   // 'jpeg' or 'png' (default: 'jpeg')
  quality: 0.9,    // JPEG quality 0-1 (default: 0.85)
}

for await (const page of pdf.renderPages(options)) {
  // ...
}
```

## API

### `openPdf(input, options?)`

Opens a PDF document.

- `input`: `string | Buffer | Uint8Array | ArrayBuffer` - File path or binary data
- `options.password?`: `string` - Password for encrypted PDFs
- `options.cMapPath?`: `string` - Custom path to CMap files
- `options.standardFontPath?`: `string` - Custom path to standard font files

### `PdfDocument`

```typescript
interface PdfDocument {
  readonly pageCount: number
  renderPages(options?: RenderOptions): AsyncGenerator<RenderedPage>
  renderPage(pageNumber: number, options?): Promise<RenderedPage>
  close(): Promise<void>
}
```

### `RenderedPage`

```typescript
interface RenderedPage {
  pageNumber: number      // Page number (1-based)
  totalPages: number      // Total number of pages
  buffer: Buffer          // Image data
  width: number           // Width in pixels
  height: number          // Height in pixels
}
```

### Error Handling

```typescript
import { openPdf, PdfError } from 'noto-pdf-ts'

try {
  const pdf = await openPdf('/path/to/document.pdf')
} catch (error) {
  if (error instanceof PdfError) {
    switch (error.code) {
      case 'FILE_NOT_FOUND':
        console.error('File not found')
        break
      case 'INVALID_PDF':
        console.error('Invalid PDF file')
        break
      case 'PASSWORD_REQUIRED':
        console.error('Password required')
        break
      case 'INVALID_PASSWORD':
        console.error('Invalid password')
        break
      default:
        console.error(error.message)
    }
  }
}
```

## Font Packages

For proper rendering of CJK (Chinese, Japanese, Korean) and other non-Latin text, you need to register fonts using the `init()` function or `PDFiumLibrary.registerFonts()` method.

### Using init() Function

The simplest way to initialize fonts:

```typescript
import { init, openPdf } from 'noto-pdf-ts'
import loadFontJp from '@noto-pdf-ts/fonts-jp'

// Initialize with Japanese font
await init({
  fonts: [await loadFontJp()],
})

// Now you can open and render PDFs with Japanese text
const pdf = await openPdf('/path/to/document.pdf')
```

### Using PDFiumLibrary Directly

For more control, use `PDFiumLibrary` directly:

```typescript
import { PDFiumLibrary, openPdf } from 'noto-pdf-ts'
import loadFontJp from '@noto-pdf-ts/fonts-jp'
import loadFontKr from '@noto-pdf-ts/fonts-kr'

// Initialize library
const library = await PDFiumLibrary.init()

// Register multiple fonts
library.registerFonts([
  await loadFontJp(),
  await loadFontKr(),
])

// Open and render PDFs
const pdf = await openPdf('/path/to/document.pdf')
```

### Available Font Packages

| Package | Languages | Size | Install |
|---------|-----------|------|---------|
| [@noto-pdf-ts/fonts-jp](https://www.npmjs.com/package/@noto-pdf-ts/fonts-jp) | Japanese (Hiragana, Katakana, Kanji) | ~9MB | `npm install @noto-pdf-ts/fonts-jp@alpha` |
| [@noto-pdf-ts/fonts-kr](https://www.npmjs.com/package/@noto-pdf-ts/fonts-kr) | Korean (Hangul, Hanja) | ~9MB | `npm install @noto-pdf-ts/fonts-kr@alpha` |
| [@noto-pdf-ts/fonts-sc](https://www.npmjs.com/package/@noto-pdf-ts/fonts-sc) | Simplified Chinese (汉字) | ~9MB | `npm install @noto-pdf-ts/fonts-sc@alpha` |
| [@noto-pdf-ts/fonts-tc](https://www.npmjs.com/package/@noto-pdf-ts/fonts-tc) | Traditional Chinese (漢字) | ~9MB | `npm install @noto-pdf-ts/fonts-tc@alpha` |
| [@noto-pdf-ts/fonts-cjk](https://www.npmjs.com/package/@noto-pdf-ts/fonts-cjk) | All CJK (JP, KR, SC, TC) | ~37MB | `npm install @noto-pdf-ts/fonts-cjk@alpha` |
| [@noto-pdf-ts/fonts-all](https://www.npmjs.com/package/@noto-pdf-ts/fonts-all) | 24 scripts (Latin, CJK, Arabic, Hebrew, Indic, etc.) | ~300MB | `npm install @noto-pdf-ts/fonts-all@alpha` |

### Using fonts-all with Tree Shaking

The `@noto-pdf-ts/fonts-all` package supports tree shaking for optimal bundle size:

```typescript
import { init } from 'noto-pdf-ts'
import loadJapanese from '@noto-pdf-ts/fonts-all/japanese'
import loadArabic from '@noto-pdf-ts/fonts-all/arabic'

// Only loads Japanese and Arabic fonts
await init({
  fonts: await Promise.all([loadJapanese(), loadArabic()]),
})
```

## Requirements

- Node.js >= 20.0.0
- sharp (peer dependency)

## License

MIT
