# @noto-pdf-ts/fonts-all

Complete collection of Noto Sans fonts for use with [@noto-pdf-ts/core](../core). This package includes fonts for 24 scripts supporting over 100 languages.

## Installation

```bash
npm install @noto-pdf-ts/fonts-all@alpha
```

## Features

- **24 Scripts Supported**: Latin, CJK, Arabic, Hebrew, Indic scripts, Southeast Asian scripts, and more
- **Tree-Shakeable**: Only fonts you import will be bundled
- **Variable Fonts**: All fonts use the Variable Font format for flexible typography
- **Full Unicode Coverage**: Comprehensive support for most modern writing systems

## Usage

### Individual Imports (Recommended)

Import only the fonts you need for optimal bundle size:

```typescript
import { PDFiumLibrary } from '@noto-pdf-ts/core'
import loadJapanese from '@noto-pdf-ts/fonts-all/japanese'
import loadArabic from '@noto-pdf-ts/fonts-all/arabic'

const library = await PDFiumLibrary.init()
const fonts = await Promise.all([loadJapanese(), loadArabic()])
library.registerFonts(fonts)
```

### Load All Fonts

For applications that need to support all languages:

```typescript
import { PDFiumLibrary } from '@noto-pdf-ts/core'
import { loadAllFonts } from '@noto-pdf-ts/fonts-all/all'

const library = await PDFiumLibrary.init()
library.registerFonts(await loadAllFonts())
```

### Load Specific Scripts

```typescript
import { loadFonts } from '@noto-pdf-ts/fonts-all/all'

// Load only Japanese, Arabic, and Hebrew fonts
const fonts = await loadFonts(['japanese', 'arabic', 'hebrew'])
```

### Main Entry Point

```typescript
import {
  loadJapanese,
  loadKorean,
  loadArabic,
  loadHebrew,
  loadDevanagari,
  // ... other exports
} from '@noto-pdf-ts/fonts-all'

const fonts = await Promise.all([
  loadJapanese(),
  loadArabic(),
])
```

## Supported Scripts

| Import Path | Script | Languages |
|-------------|--------|-----------|
| `/latin` | Latin, Greek, Cyrillic | English, Spanish, Russian, etc. |
| `/japanese` | Japanese | Japanese |
| `/korean` | Korean | Korean |
| `/chinese-simplified` | Simplified Chinese | Mandarin (PRC) |
| `/chinese-traditional` | Traditional Chinese | Mandarin (Taiwan, HK) |
| `/arabic` | Arabic | Arabic, Persian, Urdu |
| `/hebrew` | Hebrew | Hebrew, Yiddish |
| `/devanagari` | Devanagari | Hindi, Sanskrit, Marathi |
| `/bengali` | Bengali | Bengali, Assamese |
| `/tamil` | Tamil | Tamil |
| `/telugu` | Telugu | Telugu |
| `/gujarati` | Gujarati | Gujarati |
| `/kannada` | Kannada | Kannada |
| `/malayalam` | Malayalam | Malayalam |
| `/oriya` | Oriya (Odia) | Odia |
| `/gurmukhi` | Gurmukhi | Punjabi |
| `/sinhala` | Sinhala | Sinhala |
| `/thai` | Thai | Thai |
| `/lao` | Lao | Lao |
| `/myanmar` | Myanmar | Burmese |
| `/khmer` | Khmer | Khmer (Cambodian) |
| `/armenian` | Armenian | Armenian |
| `/georgian` | Georgian | Georgian |
| `/ethiopic` | Ethiopic | Amharic, Tigrinya |

## Bundle Size Considerations

The complete font collection is large (~300MB+ total). To optimize your bundle:

1. **Use individual imports**: Only import the fonts you need
2. **Tree shaking**: The package is fully tree-shakeable with `sideEffects: false`
3. **Dynamic imports**: Use dynamic imports to load fonts on-demand

```typescript
// Dynamic import example
async function loadFontForLanguage(lang: string) {
  switch (lang) {
    case 'ja':
      return (await import('@noto-pdf-ts/fonts-all/japanese')).default()
    case 'ar':
      return (await import('@noto-pdf-ts/fonts-all/arabic')).default()
    // ...
  }
}
```

## License

The fonts are licensed under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL).

The package code is licensed under the MIT License.

## Related Packages

- [@noto-pdf-ts/core](../core) - Core PDF rendering library
- [@noto-pdf-ts/fonts-jp](../fonts-jp) - Japanese fonts only
- [@noto-pdf-ts/fonts-kr](../fonts-kr) - Korean fonts only
- [@noto-pdf-ts/fonts-sc](../fonts-sc) - Simplified Chinese fonts only
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - Traditional Chinese fonts only
- [@noto-pdf-ts/fonts-cjk](../fonts-cjk) - All CJK fonts

## Support

For issues and questions, please visit the [main repository](https://github.com/ash-r1/noto-pdf-ts/issues).
