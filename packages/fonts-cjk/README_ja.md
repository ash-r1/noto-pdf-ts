# @noto-pdf-ts/fonts-cjk

[@noto-pdf-ts/core](../core) で使用するための完全な CJK（中国語、日本語、韓国語）フォントパッケージです。このパッケージは全 CJK 言語フォントを単一の便利なパッケージに含んでいます。

[English README](./README.md)

## インストール

```bash
npm install @noto-pdf-ts/fonts-cjk@alpha
```

## 使用方法

```typescript
import { init } from '@noto-pdf-ts/core'
import loadFontCjk from '@noto-pdf-ts/fonts-cjk'

// 全 CJK フォントで初期化
await init({
  fonts: [await loadFontCjk()],
})
```

### 名前付きエクスポート

```typescript
import { getFontPath, getFontData, FONT_NAME } from '@noto-pdf-ts/fonts-cjk'

// フォントファイルのパスを取得
const fontPath = getFontPath()

// フォントデータを Uint8Array として取得
const fontData = await getFontData()

// フォントファイル名を取得
console.log(FONT_NAME) // 'NotoSansCJK-VF.ttf.ttc'
```

## フォント情報

- **フォント名**: Noto Sans CJK Variable Font Collection
- **ファイル**: NotoSansCJK-VF.ttf.ttc（約37MB）
- **対応文字**: 全 CJK 言語（日本語、韓国語、簡体字中国語、繁体字中国語）+ ラテン文字
- **対応言語**:
  - 日本語（日本語）: ひらがな、カタカナ、漢字
  - 韓国語（한국어）: ハングル、漢字
  - 簡体字中国語（简体中文）: 汉字
  - 繁体字中国語（繁體中文）: 漢字
- **ウェイト範囲**: 複数のウェイトをサポートする Variable Font
- **ライセンス**: SIL Open Font License 1.1

## このパッケージを使用すべき場合

以下の場合にこのパッケージを使用してください：
- 複数の CJK 言語をサポートする必要がある
- PDF に混合 CJK コンテンツが含まれている
- 全 CJK フォントを単一の依存関係で管理したい

単一言語のユースケースでは、バンドルサイズを削減するために個別のフォントパッケージを検討してください：
- [@noto-pdf-ts/fonts-jp](../fonts-jp) - 日本語のみ（約9MB）
- [@noto-pdf-ts/fonts-kr](../fonts-kr) - 韓国語のみ（約9MB）
- [@noto-pdf-ts/fonts-sc](../fonts-sc) - 簡体字中国語のみ（約9MB）
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - 繁体字中国語のみ（約9MB）

## Variable Font について

このパッケージは Variable Font（VF）を使用しており、動的なウェイト調整が可能です。フォントファイルは単一ウェイトのフォントより大きくなりますが、タイポグラフィの柔軟性が向上します。

## ライセンス

フォントは [SIL Open Font License 1.1](https://scripts.sil.org/OFL) でライセンスされています。

パッケージのコードは MIT License でライセンスされています。

## 関連パッケージ

- [@noto-pdf-ts/core](../core) - コア PDF レンダリングライブラリ
- [@noto-pdf-ts/fonts-jp](../fonts-jp) - 日本語フォントのみ
- [@noto-pdf-ts/fonts-kr](../fonts-kr) - 韓国語フォントのみ
- [@noto-pdf-ts/fonts-sc](../fonts-sc) - 簡体字中国語フォントのみ
- [@noto-pdf-ts/fonts-tc](../fonts-tc) - 繁体字中国語フォントのみ

## サポート

問題や質問がある場合は、[メインリポジトリ](https://github.com/ash-r1/noto-pdf-ts/issues)をご覧ください。
