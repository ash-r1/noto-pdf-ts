# noto-pdf-ts

[Documentation](https://ash-r1.github.io/noto-pdf-ts/) | [API Reference](https://ash-r1.github.io/noto-pdf-ts/api/)

A simple and efficient PDF rendering library for Node.js. Convert PDF pages to images (JPEG/PNG) with built-in CJK (Chinese, Japanese, Korean) font support.

## Features

- **Simple API** - Initialize with `NotoPdf.init()` and render pages with `renderPages()`
- **Memory Efficient** - Process pages one at a time using AsyncGenerator
- **CJK Font Support** - Includes Noto Sans CJK fonts for Japanese, Korean, and Chinese text
- **TypeScript Native** - Full type definitions included
- **ESM / CommonJS** - Works with both module systems
- **Modern** - Supports `await using` syntax (ES2024 AsyncDisposable)

## Packages

This is a monorepo containing multiple packages:

| Package | Description | Version |
|---------|-------------|---------|
| [@noto-pdf-ts/core](./packages/core) | Core PDF rendering library | [![npm](https://img.shields.io/npm/v/@noto-pdf-ts/core/alpha)](https://www.npmjs.com/package/@noto-pdf-ts/core) |
| [@noto-pdf-ts/fonts-jp](./packages/fonts-jp) | Noto Sans Japanese font | [![npm](https://img.shields.io/npm/v/@noto-pdf-ts/fonts-jp/alpha)](https://www.npmjs.com/package/@noto-pdf-ts/fonts-jp) |
| [@noto-pdf-ts/fonts-kr](./packages/fonts-kr) | Noto Sans Korean font | [![npm](https://img.shields.io/npm/v/@noto-pdf-ts/fonts-kr/alpha)](https://www.npmjs.com/package/@noto-pdf-ts/fonts-kr) |
| [@noto-pdf-ts/fonts-sc](./packages/fonts-sc) | Noto Sans Simplified Chinese font | [![npm](https://img.shields.io/npm/v/@noto-pdf-ts/fonts-sc/alpha)](https://www.npmjs.com/package/@noto-pdf-ts/fonts-sc) |
| [@noto-pdf-ts/fonts-tc](./packages/fonts-tc) | Noto Sans Traditional Chinese font | [![npm](https://img.shields.io/npm/v/@noto-pdf-ts/fonts-tc/alpha)](https://www.npmjs.com/package/@noto-pdf-ts/fonts-tc) |
| [@noto-pdf-ts/fonts-cjk](./packages/fonts-cjk) | All CJK fonts (Japanese, Korean, SC, TC) | [![npm](https://img.shields.io/npm/v/@noto-pdf-ts/fonts-cjk/alpha)](https://www.npmjs.com/package/@noto-pdf-ts/fonts-cjk) |

## Installation

> **Note:** This package is currently in alpha. APIs may change in future releases.

### Basic Installation

```bash
# Core library
npm install @noto-pdf-ts/core@alpha

# With specific language support
npm install @noto-pdf-ts/core@alpha @noto-pdf-ts/fonts-jp@alpha

# Or with all CJK fonts
npm install @noto-pdf-ts/core@alpha @noto-pdf-ts/fonts-cjk@alpha
```

### Font Packages

Choose the font package(s) you need:

- `@noto-pdf-ts/fonts-jp` - Japanese (Hiragana, Katakana, Kanji)
- `@noto-pdf-ts/fonts-kr` - Korean (Hangul)
- `@noto-pdf-ts/fonts-sc` - Simplified Chinese (汉字)
- `@noto-pdf-ts/fonts-tc` - Traditional Chinese (漢字)
- `@noto-pdf-ts/fonts-cjk` - All of the above

## Quick Start

```typescript
import { NotoPdf } from '@noto-pdf-ts/core'
import loadFontJp from '@noto-pdf-ts/fonts-jp'
import fs from 'node:fs/promises'

// Initialize with Japanese font
const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })

// Open and render PDF
const pdf = await notoPdf.openPdf('/path/to/document.pdf')
console.log(`Pages: ${pdf.pageCount}`)

for await (const page of pdf.renderPages({ format: 'jpeg', scale: 1.5 })) {
  console.log(`Rendering page ${page.pageNumber}/${page.totalPages}...`)
  await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
}

// Clean up
await pdf.close()
notoPdf.destroy()
```

### Using `await using` (ES2024)

```typescript
import { NotoPdf } from '@noto-pdf-ts/core'
import loadFontCjk from '@noto-pdf-ts/fonts-cjk'

// Both NotoPdf and PdfDocument support await using
await using notoPdf = await NotoPdf.init({ fonts: [await loadFontCjk()] })
await using pdf = await notoPdf.openPdf('/path/to/document.pdf')

for await (const page of pdf.renderPages()) {
  // Process pages...
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

## API Reference

See the [core package documentation](./packages/core) for detailed API documentation.

## Migration Guide (v0.x → v1.x)

If you're upgrading from the previous version of `noto-pdf-ts`, here are the breaking changes:

### 1. Package Name Change

```typescript
// Before (v0.x)
import { openPdf } from 'noto-pdf-ts'

// After (v1.x)
import { NotoPdf } from '@noto-pdf-ts/core'
```

### 2. Font Installation Required

```bash
# Before (v0.x) - fonts were bundled
npm install noto-pdf-ts@alpha

# After (v1.x) - install fonts separately
npm install @noto-pdf-ts/core@alpha @noto-pdf-ts/fonts-jp@alpha
```

### 3. Instance-Based API

```typescript
// Before (v0.x) - global functions
import { PDFiumLibrary, openPdf } from '@noto-pdf-ts/core'
import loadFontJp from '@noto-pdf-ts/fonts-jp'

const library = await PDFiumLibrary.init()
library.registerFonts([await loadFontJp()])
const pdf = await openPdf('document.pdf')

// After (v1.x) - instance methods
import { NotoPdf } from '@noto-pdf-ts/core'
import loadFontJp from '@noto-pdf-ts/fonts-jp'

const notoPdf = await NotoPdf.init({ fonts: [await loadFontJp()] })
const pdf = await notoPdf.openPdf('document.pdf')
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/noto-pdf-ts.git
cd noto-pdf-ts

# Install dependencies
pnpm install

# Download font files
pnpm download-fonts
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @noto-pdf-ts/core build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @noto-pdf-ts/core test
```

### Project Structure

```
noto-pdf-ts/
├── packages/
│   ├── core/           # Core rendering library
│   ├── fonts-jp/       # Japanese fonts
│   ├── fonts-kr/       # Korean fonts
│   ├── fonts-sc/       # Simplified Chinese fonts
│   ├── fonts-tc/       # Traditional Chinese fonts
│   └── fonts-cjk/      # All CJK fonts
├── fixtures/           # Test fixtures
├── scripts/            # Build and utility scripts
└── pnpm-workspace.yaml # Monorepo configuration
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The Noto Sans CJK fonts are licensed under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL).

## Related Projects

- [PDFium](https://pdfium.googlesource.com/pdfium/) - The PDF rendering engine used by this library
- [Noto Fonts](https://fonts.google.com/noto) - The font family used for CJK support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/noto-pdf-ts/issues) on GitHub.
