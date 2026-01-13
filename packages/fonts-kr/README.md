# @noto-pdf-ts/fonts-kr

Noto Sans Korean Variable Font for use with [@noto-pdf-ts/core](../core).

## Installation

```bash
npm install @noto-pdf-ts/fonts-kr@alpha
```

## Usage

```typescript
import { init } from '@noto-pdf-ts/core'
import loadFontKr from '@noto-pdf-ts/fonts-kr'

// Initialize with Korean font
await init({
  fonts: [await loadFontKr()],
})
```

### Named Exports

```typescript
import { getFontPath, getFontData, FONT_NAME } from '@noto-pdf-ts/fonts-kr'

// Get font file path
const fontPath = getFontPath()

// Get font data as Uint8Array
const fontData = await getFontData()

// Get font filename
console.log(FONT_NAME) // 'NotoSansKR-VF.ttf'
```

## Font Information

- **Font Name**: Noto Sans Korean Variable Font
- **File**: NotoSansKR-VF.ttf (~9MB)
- **Coverage**: Hangul, Hanja, Latin
- **Weight Range**: Variable font supporting multiple weights
- **License**: SIL Open Font License 1.1

## About Variable Fonts

This package uses a Variable Font (VF) which allows for dynamic weight adjustment. The font file is larger than a single-weight font but provides greater flexibility in typography.

## License

The font is licensed under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL).

The package code is licensed under the MIT License.

## Related Packages

- [@noto-pdf-ts/core](../core) - Core PDF rendering library
- [@noto-pdf-ts/fonts-jp](../fonts-jp) - Japanese fonts
- [@noto-pdf-ts/fonts-sc](../fonts-sc) - Simplified Chinese fonts
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - Traditional Chinese fonts
- [@noto-pdf-ts/fonts-cjk](../fonts-cjk) - All CJK fonts

## Support

For issues and questions, please visit the [main repository](https://github.com/ash-r1/noto-pdf-ts/issues).
