# @noto-pdf-ts/fonts-sc

Noto Sans Simplified Chinese Variable Font for use with [@noto-pdf-ts/core](../core).

## Installation

```bash
npm install @noto-pdf-ts/fonts-sc@alpha
```

## Usage

```typescript
import { init } from '@noto-pdf-ts/core'
import loadFontSc from '@noto-pdf-ts/fonts-sc'

// Initialize with Simplified Chinese font
await init({
  fonts: [await loadFontSc()],
})
```

### Named Exports

```typescript
import { getFontPath, getFontData, FONT_NAME } from '@noto-pdf-ts/fonts-sc'

// Get font file path
const fontPath = getFontPath()

// Get font data as Uint8Array
const fontData = await getFontData()

// Get font filename
console.log(FONT_NAME) // 'NotoSansSC-VF.ttf'
```

## Font Information

- **Font Name**: Noto Sans Simplified Chinese Variable Font
- **File**: NotoSansSC-VF.ttf (~9MB)
- **Coverage**: Simplified Chinese (汉字), Latin
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
- [@noto-pdf-ts/fonts-kr](../fonts-kr) - Korean fonts
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - Traditional Chinese fonts
- [@noto-pdf-ts/fonts-cjk](../fonts-cjk) - All CJK fonts

## Support

For issues and questions, please visit the [main repository](https://github.com/ash-r1/noto-pdf-ts/issues).
