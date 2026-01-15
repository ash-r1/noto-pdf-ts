# @noto-pdf-ts/fonts-cjk

Complete CJK (Chinese, Japanese, Korean) font package for use with [@noto-pdf-ts/core](../core). This package includes all CJK language fonts in a single convenient package.

## Installation

```bash
npm install @noto-pdf-ts/fonts-cjk@alpha
```

## Usage

```typescript
import { init } from '@noto-pdf-ts/core'
import loadFontCjk from '@noto-pdf-ts/fonts-cjk'

// Initialize with all CJK fonts
await init({
  fonts: [await loadFontCjk()],
})
```

### Named Exports

```typescript
import { getFontPath, getFontData, FONT_NAME } from '@noto-pdf-ts/fonts-cjk'

// Get font file path
const fontPath = getFontPath()

// Get font data as Uint8Array
const fontData = await getFontData()

// Get font filename
console.log(FONT_NAME) // 'NotoSansCJK-VF.ttf.ttc'
```

## Font Information

- **Font Name**: Noto Sans CJK Variable Font Collection
- **File**: NotoSansCJK-VF.ttf.ttc (~37MB)
- **Coverage**: All CJK languages (Japanese, Korean, Simplified Chinese, Traditional Chinese) + Latin
- **Languages**:
  - Japanese (日本語): Hiragana, Katakana, Kanji
  - Korean (한국어): Hangul, Hanja
  - Simplified Chinese (简体中文): 汉字
  - Traditional Chinese (繁體中文): 漢字
- **Weight Range**: Variable font supporting multiple weights
- **License**: SIL Open Font License 1.1

## When to Use This Package

Use this package when:
- You need support for multiple CJK languages
- Your PDFs contain mixed CJK content
- You want a single dependency for all CJK fonts

For single-language use cases, consider using individual font packages to reduce bundle size:
- [@noto-pdf-ts/fonts-jp](../fonts-jp) - Japanese only (~9MB)
- [@noto-pdf-ts/fonts-kr](../fonts-kr) - Korean only (~9MB)
- [@noto-pdf-ts/fonts-sc](../fonts-sc) - Simplified Chinese only (~9MB)
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - Traditional Chinese only (~9MB)

## About Variable Fonts

This package uses a Variable Font (VF) which allows for dynamic weight adjustment. The font file is larger than single-weight fonts but provides greater flexibility in typography.

## License

The font is licensed under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL).

The package code is licensed under the MIT License.

## Related Packages

- [@noto-pdf-ts/core](../core) - Core PDF rendering library
- [@noto-pdf-ts/fonts-jp](../fonts-jp) - Japanese fonts only
- [@noto-pdf-ts/fonts-kr](../fonts-kr) - Korean fonts only
- [@noto-pdf-ts/fonts-sc](../fonts-sc) - Simplified Chinese fonts only
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - Traditional Chinese fonts only

## Support

For issues and questions, please visit the [main repository](https://github.com/ash-r1/noto-pdf-ts/issues).
