# @noto-pdf-ts/core

[Documentation](https://ash-r1.github.io/noto-pdf-ts/) | [API Reference](https://ash-r1.github.io/noto-pdf-ts/api/)

[日本語版 README](./README_ja.md)

A simple and efficient PDF conversion library for Node.js. Convert PDF pages to images (JPEG/PNG).

## Features

- Simple API - Initialize with `NotoPdf.init()` and convert PDFs with `openPdf()`
- Memory efficient - Process one page at a time using AsyncGenerator
- Japanese/CJK font support - Use separate font packages for CJK support
- Full TypeScript support - Includes type definitions
- ESM / CommonJS compatible
- `await using` syntax support (ES2024 AsyncDisposable)

## Installation

> **Note:** This package is currently in alpha. The API may change in future releases.

```bash
# Install the core library
npm install @noto-pdf-ts/core@alpha

# With Japanese font support
npm install @noto-pdf-ts/core@alpha @noto-pdf-ts/fonts-jp@alpha
```

### Peer Dependencies

This library requires [sharp](https://github.com/lovell/sharp) as a peer dependency for image processing:

```bash
npm install sharp
```

> **Note:** sharp uses pre-built binaries for most platforms, so no native compilation is typically required.

## Usage

### Basic Usage

```typescript
import { NotoPdf } from '@noto-pdf-ts/core'
import loadFontJp from '@noto-pdf-ts/fonts-jp'
import fs from 'node:fs/promises'

// Initialize with fonts
const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })

// Open a PDF
const pdf = await notoPdf.openPdf('/path/to/document.pdf')
console.log(`Page count: ${pdf.pageCount}`)

// Convert all pages to images
for await (const page of pdf.renderPages({ format: 'jpeg', scale: 1.5 })) {
  console.log(`Converting page ${page.pageNumber}/${page.totalPages}...`)
  await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
}

// Clean up
await pdf.close()
notoPdf.destroy()
```

### await using Syntax (ES2024)

```typescript
import { NotoPdf } from '@noto-pdf-ts/core'
import loadFontJp from '@noto-pdf-ts/fonts-jp'

// Both NotoPdf and PdfDocument support await using
await using notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })
await using pdf = await notoPdf.openPdf('/path/to/document.pdf')

for await (const page of pdf.renderPages()) {
  // ...
}
// Automatically closed when scope ends
```

### Processing Multiple PDFs

```typescript
import { NotoPdf } from '@noto-pdf-ts/core'
import loadFontJp from '@noto-pdf-ts/fonts-jp'

const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })

for (const file of pdfFiles) {
  const pdf = await notoPdf.openPdf(file)
  for await (const page of pdf.renderPages()) {
    await fs.writeFile(`${file}-${page.pageNumber}.jpg`, page.buffer)
  }
  await pdf.close()
}

notoPdf.destroy()
```

### Various Input Formats

```typescript
import { NotoPdf } from '@noto-pdf-ts/core'

const notoPdf = await NotoPdf.init()

// File path
const pdf1 = await notoPdf.openPdf('/path/to/document.pdf')

// Buffer
const buffer = await fs.readFile('/path/to/document.pdf')
const pdf2 = await notoPdf.openPdf(buffer)

// Uint8Array
const response = await fetch('https://example.com/document.pdf')
const data = new Uint8Array(await response.arrayBuffer())
const pdf3 = await notoPdf.openPdf(data)

// Password-protected PDF
const pdf4 = await notoPdf.openPdf('/path/to/encrypted.pdf', { password: 'secret' })
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

### `NotoPdf`

The main entry point for PDF operations.

```typescript
import { NotoPdf } from '@noto-pdf-ts/core'
import loadFontJp from '@noto-pdf-ts/fonts-jp'

// Initialize with fonts
const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })

// Or initialize without fonts (for PDFs with embedded fonts)
const notoPdf = await NotoPdf.init()

// Register fonts later if needed
notoPdf.registerFonts([await loadFontKr()])

// Open a PDF
const pdf = await notoPdf.openPdf('/path/to/document.pdf')

// Clean up when done
notoPdf.destroy()
```

### `NotoPdf.init(options?)`

Creates a new NotoPdf instance.

- `options.fonts?`: `FontConfig[]` - Fonts to register during initialization

### `notoPdf.openPdf(input, options?)`

Opens a PDF document.

- `input`: `string | Buffer | Uint8Array | ArrayBuffer` - File path or binary data
- `options.password?`: `string` - Password for encrypted PDFs

### `PdfDocument`

```typescript
interface PdfDocument {
  readonly pageCount: number
  renderPages(options?: RenderOptions): AsyncGenerator<RenderedPage>
  renderPage(pageNumber: number, options?): Promise<RenderedPage>
  close(): Promise<void>
  [Symbol.asyncDispose](): Promise<void>
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
import { NotoPdf, PdfError } from '@noto-pdf-ts/core'

const notoPdf = await NotoPdf.init()

try {
  const pdf = await notoPdf.openPdf('/path/to/document.pdf')
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

## Requirements

- Node.js >= 20.0.0
- sharp (peer dependency)

## License

MIT
