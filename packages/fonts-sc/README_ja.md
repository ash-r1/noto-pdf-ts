# @noto-pdf-ts/fonts-sc

[@noto-pdf-ts/core](../core) で使用するための Noto Sans Simplified Chinese Variable Font パッケージです。

[English README](./README.md)

## インストール

```bash
npm install @noto-pdf-ts/fonts-sc@alpha
```

## 使用方法

```typescript
import { init } from '@noto-pdf-ts/core'
import loadFontSc from '@noto-pdf-ts/fonts-sc'

// 簡体字中国語フォントで初期化
await init({
  fonts: [await loadFontSc()],
})
```

### 名前付きエクスポート

```typescript
import { getFontPath, getFontData, FONT_NAME } from '@noto-pdf-ts/fonts-sc'

// フォントファイルのパスを取得
const fontPath = getFontPath()

// フォントデータを Uint8Array として取得
const fontData = await getFontData()

// フォントファイル名を取得
console.log(FONT_NAME) // 'NotoSansSC-VF.ttf'
```

## フォント情報

- **フォント名**: Noto Sans Simplified Chinese Variable Font
- **ファイル**: NotoSansSC-VF.ttf（約9MB）
- **対応文字**: 簡体字中国語（汉字）、ラテン文字
- **ウェイト範囲**: 複数のウェイトをサポートする Variable Font
- **ライセンス**: SIL Open Font License 1.1

## Variable Font について

このパッケージは Variable Font（VF）を使用しており、動的なウェイト調整が可能です。フォントファイルは単一ウェイトのフォントより大きくなりますが、タイポグラフィの柔軟性が向上します。

## ライセンス

フォントは [SIL Open Font License 1.1](https://scripts.sil.org/OFL) でライセンスされています。

パッケージのコードは MIT License でライセンスされています。

## 関連パッケージ

- [@noto-pdf-ts/core](../core) - コア PDF レンダリングライブラリ
- [@noto-pdf-ts/fonts-jp](../fonts-jp) - 日本語フォント
- [@noto-pdf-ts/fonts-kr](../fonts-kr) - 韓国語フォント
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - 繁体字中国語フォント
- [@noto-pdf-ts/fonts-cjk](../fonts-cjk) - 全 CJK フォント

## サポート

問題や質問がある場合は、[メインリポジトリ](https://github.com/ash-r1/noto-pdf-ts/issues)をご覧ください。
