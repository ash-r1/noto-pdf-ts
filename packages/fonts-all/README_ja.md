# @noto-pdf-ts/fonts-all

[@noto-pdf-ts/core](../core) で使用するための Noto Sans フォントの完全コレクションです。このパッケージには 100 以上の言語をサポートする 24 のスクリプト用フォントが含まれています。

[English README](./README.md)

## インストール

```bash
npm install @noto-pdf-ts/fonts-all@alpha
```

## 特徴

- **24 スクリプト対応**: ラテン、CJK、アラビア、ヘブライ、インド系スクリプト、東南アジア系スクリプトなど
- **Tree-Shakeable**: インポートしたフォントのみがバンドルされます
- **Variable Font**: 全フォントが柔軟なタイポグラフィのために Variable Font 形式を使用
- **完全な Unicode カバレッジ**: ほとんどの現代の書記体系を包括的にサポート

## 使用方法

### 個別インポート（推奨）

最適なバンドルサイズのために必要なフォントのみをインポート：

```typescript
import { PDFiumLibrary } from '@noto-pdf-ts/core'
import loadJapanese from '@noto-pdf-ts/fonts-all/japanese'
import loadArabic from '@noto-pdf-ts/fonts-all/arabic'

const library = await PDFiumLibrary.init()
const fonts = await Promise.all([loadJapanese(), loadArabic()])
library.registerFonts(fonts)
```

### 全フォントをロード

全言語をサポートする必要があるアプリケーション向け：

```typescript
import { PDFiumLibrary } from '@noto-pdf-ts/core'
import { loadAllFonts } from '@noto-pdf-ts/fonts-all/all'

const library = await PDFiumLibrary.init()
library.registerFonts(await loadAllFonts())
```

### 特定のスクリプトをロード

```typescript
import { loadFonts } from '@noto-pdf-ts/fonts-all/all'

// 日本語、アラビア語、ヘブライ語フォントのみをロード
const fonts = await loadFonts(['japanese', 'arabic', 'hebrew'])
```

### メインエントリーポイント

```typescript
import {
  loadJapanese,
  loadKorean,
  loadArabic,
  loadHebrew,
  loadDevanagari,
  // ... その他のエクスポート
} from '@noto-pdf-ts/fonts-all'

const fonts = await Promise.all([
  loadJapanese(),
  loadArabic(),
])
```

## サポートされているスクリプト

| インポートパス | スクリプト | 言語 |
|---------------|-----------|------|
| `/latin` | ラテン、ギリシャ、キリル | 英語、スペイン語、ロシア語など |
| `/japanese` | 日本語 | 日本語 |
| `/korean` | 韓国語 | 韓国語 |
| `/chinese-simplified` | 簡体字中国語 | 中国語（中国） |
| `/chinese-traditional` | 繁体字中国語 | 中国語（台湾、香港） |
| `/arabic` | アラビア語 | アラビア語、ペルシャ語、ウルドゥー語 |
| `/hebrew` | ヘブライ語 | ヘブライ語、イディッシュ語 |
| `/devanagari` | デーヴァナーガリー | ヒンディー語、サンスクリット、マラーティー語 |
| `/bengali` | ベンガル語 | ベンガル語、アッサム語 |
| `/tamil` | タミル語 | タミル語 |
| `/telugu` | テルグ語 | テルグ語 |
| `/gujarati` | グジャラート語 | グジャラート語 |
| `/kannada` | カンナダ語 | カンナダ語 |
| `/malayalam` | マラヤーラム語 | マラヤーラム語 |
| `/oriya` | オリヤー語（オディア語） | オディア語 |
| `/gurmukhi` | グルムキー | パンジャーブ語 |
| `/sinhala` | シンハラ語 | シンハラ語 |
| `/thai` | タイ語 | タイ語 |
| `/lao` | ラオ語 | ラオ語 |
| `/myanmar` | ミャンマー語 | ビルマ語 |
| `/khmer` | クメール語 | クメール語（カンボジア語） |
| `/armenian` | アルメニア語 | アルメニア語 |
| `/georgian` | ジョージア語 | ジョージア語 |
| `/ethiopic` | エチオピア語 | アムハラ語、ティグリニャ語 |

## バンドルサイズの考慮事項

完全なフォントコレクションは大きい（合計約 300MB 以上）です。バンドルを最適化するには：

1. **個別インポートを使用**: 必要なフォントのみをインポート
2. **Tree Shaking**: パッケージは `sideEffects: false` で完全に Tree-Shakeable
3. **動的インポート**: 動的インポートを使用してオンデマンドでフォントをロード

```typescript
// 動的インポートの例
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

## ライセンス

フォントは [SIL Open Font License 1.1](https://scripts.sil.org/OFL) でライセンスされています。

パッケージのコードは MIT License でライセンスされています。

## 関連パッケージ

- [@noto-pdf-ts/core](../core) - コア PDF レンダリングライブラリ
- [@noto-pdf-ts/fonts-jp](../fonts-jp) - 日本語フォントのみ
- [@noto-pdf-ts/fonts-kr](../fonts-kr) - 韓国語フォントのみ
- [@noto-pdf-ts/fonts-sc](../fonts-sc) - 簡体字中国語フォントのみ
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - 繁体字中国語フォントのみ
- [@noto-pdf-ts/fonts-cjk](../fonts-cjk) - 全 CJK フォント

## サポート

問題や質問がある場合は、[メインリポジトリ](https://github.com/ash-r1/noto-pdf-ts/issues)をご覧ください。
