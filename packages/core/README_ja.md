# noto-pdf-ts

[ドキュメント](https://ash-r1.github.io/noto-pdf-ts/) | [API リファレンス](https://ash-r1.github.io/noto-pdf-ts/api/)

[English README](./README.md)

Node.js 向けのシンプルで効率的な PDF 変換ライブラリです。PDF ページを画像（JPEG/PNG）に変換できます。

## 特徴

- シンプルな API - `openPdf()` で PDF を開き、`renderPages()` で画像に変換
- メモリ効率 - AsyncGenerator を使用した1ページずつの処理
- 日本語・CJK フォント対応 - pdfjs-dist からの自動 CMap 検出
- TypeScript 完全対応 - 型定義付き
- ESM / CommonJS 両対応
- `await using` 構文対応（ES2024 AsyncDisposable）

## インストール

> **注意:** このパッケージは現在 alpha 版です。API は将来のリリースで変更される可能性があります。

```bash
# 最新の alpha 版をインストール
npm install noto-pdf-ts@alpha
```

### ピア依存関係

このライブラリは画像処理のために [sharp](https://github.com/lovell/sharp) をピア依存関係として必要とします：

```bash
npm install sharp
```

> **注意:** sharp はほとんどのプラットフォーム向けにビルド済みバイナリを使用するため、通常はネイティブコンパイルは不要です。

### フォントパッケージ

CJK（中国語、日本語、韓国語）やその他の言語をサポートするには、適切なフォントパッケージをインストールしてください：

```bash
# 日本語サポート
npm install @noto-pdf-ts/fonts-jp@alpha

# 韓国語サポート
npm install @noto-pdf-ts/fonts-kr@alpha

# 簡体字中国語サポート
npm install @noto-pdf-ts/fonts-sc@alpha

# 繁体字中国語サポート
npm install @noto-pdf-ts/fonts-tc@alpha

# 全 CJK 言語（日本語、韓国語、簡体字、繁体字）
npm install @noto-pdf-ts/fonts-cjk@alpha

# 全スクリプト（ラテン、アラビア、ヘブライ、インド系など24種類）
npm install @noto-pdf-ts/fonts-all@alpha
```

詳細は下記の[フォントパッケージ](#フォントパッケージ-1)セクションを参照してください。

## 使用方法

### 基本的な使い方

```typescript
import { openPdf } from 'noto-pdf-ts'
import fs from 'node:fs/promises'

// PDF を開く
const pdf = await openPdf('/path/to/document.pdf')
console.log(`ページ数: ${pdf.pageCount}`)

// 全ページを画像に変換
for await (const page of pdf.renderPages({ format: 'jpeg', scale: 1.5 })) {
  console.log(`${page.pageNumber}/${page.totalPages} ページを変換中...`)
  await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
}

// 完了後は必ず閉じる
await pdf.close()
```

### await using 構文（ES2024）

```typescript
import { openPdf } from 'noto-pdf-ts'

// await using を使えば自動でクローズされる
await using pdf = await openPdf('/path/to/document.pdf')

for await (const page of pdf.renderPages()) {
  // ...
}
// スコープ終了時に自動でクローズ
```

### 便利関数

```typescript
import { renderPdfPages, getPageCount } from 'noto-pdf-ts'

// 1行で全ページを変換（自動でクローズ）
for await (const page of renderPdfPages('/path/to/document.pdf', { scale: 2 })) {
  await fs.writeFile(`page-${page.pageNumber}.jpg`, page.buffer)
}

// ページ数だけを取得
const count = await getPageCount('/path/to/document.pdf')
console.log(`${count} ページ`)
```

### 様々な入力形式

```typescript
import { openPdf } from 'noto-pdf-ts'

// ファイルパス
const pdf1 = await openPdf('/path/to/document.pdf')

// Buffer
const buffer = await fs.readFile('/path/to/document.pdf')
const pdf2 = await openPdf(buffer)

// Uint8Array
const response = await fetch('https://example.com/document.pdf')
const data = new Uint8Array(await response.arrayBuffer())
const pdf3 = await openPdf(data)

// パスワード付き PDF
const pdf4 = await openPdf('/path/to/encrypted.pdf', { password: 'secret' })
```

### 特定ページの変換

```typescript
// 単一ページを変換
const page = await pdf.renderPage(1)

// 特定のページ番号を指定
for await (const page of pdf.renderPages({ pages: [1, 3, 5] })) {
  // 1, 3, 5 ページのみ変換
}

// ページ範囲を指定
for await (const page of pdf.renderPages({ pages: { start: 2, end: 4 } })) {
  // 2〜4 ページを変換
}
```

### レンダリングオプション

```typescript
const options = {
  scale: 2.0,      // スケール（デフォルト: 1.5）
  format: 'png',   // 'jpeg' または 'png'（デフォルト: 'jpeg'）
  quality: 0.9,    // JPEG 品質 0-1（デフォルト: 0.85）
}

for await (const page of pdf.renderPages(options)) {
  // ...
}
```

## API

### `openPdf(input, options?)`

PDF ドキュメントを開きます。

- `input`: `string | Buffer | Uint8Array | ArrayBuffer` - ファイルパスまたはバイナリデータ
- `options.password?`: `string` - 暗号化 PDF のパスワード
- `options.cMapPath?`: `string` - CMap ファイルへのカスタムパス
- `options.standardFontPath?`: `string` - 標準フォントファイルへのカスタムパス

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
  pageNumber: number      // ページ番号（1始まり）
  totalPages: number      // 総ページ数
  buffer: Buffer          // 画像データ
  width: number           // 幅（ピクセル）
  height: number          // 高さ（ピクセル）
}
```

### エラーハンドリング

```typescript
import { openPdf, PdfError } from 'noto-pdf-ts'

try {
  const pdf = await openPdf('/path/to/document.pdf')
} catch (error) {
  if (error instanceof PdfError) {
    switch (error.code) {
      case 'FILE_NOT_FOUND':
        console.error('ファイルが見つかりません')
        break
      case 'INVALID_PDF':
        console.error('無効な PDF ファイルです')
        break
      case 'PASSWORD_REQUIRED':
        console.error('パスワードが必要です')
        break
      case 'INVALID_PASSWORD':
        console.error('パスワードが間違っています')
        break
      default:
        console.error(error.message)
    }
  }
}
```

## フォントパッケージ

CJK（中国語、日本語、韓国語）やその他の非ラテン文字を正しくレンダリングするには、`init()` 関数または `PDFiumLibrary.registerFonts()` メソッドを使用してフォントを登録する必要があります。

### init() 関数を使用

フォントを初期化する最も簡単な方法：

```typescript
import { init, openPdf } from 'noto-pdf-ts'
import loadFontJp from '@noto-pdf-ts/fonts-jp'

// 日本語フォントで初期化
await init({
  fonts: [await loadFontJp()],
})

// 日本語テキストを含む PDF を開いてレンダリング可能に
const pdf = await openPdf('/path/to/document.pdf')
```

### PDFiumLibrary を直接使用

より細かい制御が必要な場合は、`PDFiumLibrary` を直接使用：

```typescript
import { PDFiumLibrary, openPdf } from 'noto-pdf-ts'
import loadFontJp from '@noto-pdf-ts/fonts-jp'
import loadFontKr from '@noto-pdf-ts/fonts-kr'

// ライブラリを初期化
const library = await PDFiumLibrary.init()

// 複数のフォントを登録
library.registerFonts([
  await loadFontJp(),
  await loadFontKr(),
])

// PDF を開いてレンダリング
const pdf = await openPdf('/path/to/document.pdf')
```

### 利用可能なフォントパッケージ

| パッケージ | 対応言語 | サイズ | インストール |
|-----------|----------|--------|-------------|
| [@noto-pdf-ts/fonts-jp](https://www.npmjs.com/package/@noto-pdf-ts/fonts-jp) | 日本語（ひらがな、カタカナ、漢字） | ~9MB | `npm install @noto-pdf-ts/fonts-jp@alpha` |
| [@noto-pdf-ts/fonts-kr](https://www.npmjs.com/package/@noto-pdf-ts/fonts-kr) | 韓国語（ハングル、漢字） | ~9MB | `npm install @noto-pdf-ts/fonts-kr@alpha` |
| [@noto-pdf-ts/fonts-sc](https://www.npmjs.com/package/@noto-pdf-ts/fonts-sc) | 簡体字中国語（汉字） | ~9MB | `npm install @noto-pdf-ts/fonts-sc@alpha` |
| [@noto-pdf-ts/fonts-tc](https://www.npmjs.com/package/@noto-pdf-ts/fonts-tc) | 繁体字中国語（漢字） | ~9MB | `npm install @noto-pdf-ts/fonts-tc@alpha` |
| [@noto-pdf-ts/fonts-cjk](https://www.npmjs.com/package/@noto-pdf-ts/fonts-cjk) | 全 CJK（日、韓、簡、繁） | ~37MB | `npm install @noto-pdf-ts/fonts-cjk@alpha` |
| [@noto-pdf-ts/fonts-all](https://www.npmjs.com/package/@noto-pdf-ts/fonts-all) | 24 スクリプト（ラテン、CJK、アラビア、ヘブライ、インド系など） | ~300MB | `npm install @noto-pdf-ts/fonts-all@alpha` |

### fonts-all での Tree Shaking

`@noto-pdf-ts/fonts-all` パッケージは最適なバンドルサイズのために Tree Shaking をサポートしています：

```typescript
import { init } from 'noto-pdf-ts'
import loadJapanese from '@noto-pdf-ts/fonts-all/japanese'
import loadArabic from '@noto-pdf-ts/fonts-all/arabic'

// 日本語とアラビア語のフォントのみロード
await init({
  fonts: await Promise.all([loadJapanese(), loadArabic()]),
})
```

## 動作環境

- Node.js >= 20.0.0
- sharp（ピア依存関係）

## ライセンス

MIT
