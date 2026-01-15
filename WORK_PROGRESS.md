# モノレポ移行作業 - 進捗状況レポート

**最終更新**: 2026-01-13 07:50 UTC
**作業状態**: Phase 4 途中で中断

---

## 完了済み作業

### Phase 1-3: モノレポ基盤構築とパッケージ移行（完了済み）

✅ **基盤構築**
- pnpm workspace設定完了
- tsconfig.base.json作成
- ルートpackage.json更新
- scripts/download-fonts.js実装

✅ **Coreパッケージ移行**
- @noto-pdf-ts/coreへの移行完了
- 不要なファイル削除（wasm-full.ts, 埋め込みフォント）
- API更新完了

✅ **フォントパッケージ作成**
- 全5パッケージ作成完了（fonts-jp/kr/sc/tc/cjk）
- Variable Fonts (VF) ダウンロード済み
- ビルド成功確認済み

### Phase 4: テスト整合性確保（部分完了）

✅ **完了**
- `fixtures/fonts/`ディレクトリ作成
- `NotoSansCJK-VF.ttf.ttc`をfixturesにコピー（37MB）
- `@noto-pdf-ts/fonts-cjk`をcore devDependenciesに追加
- `sharp`をcore devDependenciesに追加

❌ **未完了**
- `pnpm install`実行（sharp追加後）
- テスト実行と検証

---

## 現在の状態

### 最後に編集したファイル

**packages/core/package.json**
- 変更内容: devDependenciesに以下を追加
  ```json
  "@noto-pdf-ts/fonts-cjk": "workspace:*",
  "sharp": "^0.33.5"
  ```
- 理由: CJKレンダリングテストで必要

### 直前の問題

テスト実行時にエラー発生:
```
Error: Failed to load url sharp (resolved id: sharp)
```

原因: sharpがdevDependenciesに含まれていなかった
対処: package.jsonにsharp追加済み（インストール前に中断）

---

## 次のステップ（再開時の手順）

### 1. Phase 4 完了

```bash
# 1. 依存関係のインストール
pnpm install

# 2. テスト実行
pnpm --filter @noto-pdf-ts/core test:ci

# 3. 全パッケージビルド確認
pnpm build
```

**期待結果**:
- sharpがインストールされる
- CJKレンダリングテストが実行される（またはskipされる）
- 他のテストがパスする

### 2. Phase 5: CI/CD更新

#### 2.1 `.github/workflows/ci.yml`更新

**buildジョブ** (line 70-84付近):
```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Download fonts  # 追加
  run: pnpm download-fonts

- name: Build
  run: pnpm build
```

**testジョブ** (line 42-68付近):
```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Download fonts  # 追加
  run: pnpm download-fonts

- name: Run tests
  run: pnpm test:ci
```

#### 2.2 `.github/workflows/release.yml`更新

**line 34-35付近**:
```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Download fonts  # 追加
  run: pnpm download-fonts

- name: Create Release Pull Request or Publish
  ...
```

### 3. Phase 6: ドキュメント作成

#### 3.1 ルート`README.md`作成

主な内容:
- モノレポ概要
- パッケージ一覧表
- クイックスタート
- Migration guide (v0.x → v1.x)
- 開発手順

参考: `/home/node/.claude/plans/spicy-napping-castle.md` Phase 6.1

#### 3.2 フォントパッケージREADME更新

各パッケージ（fonts-jp/kr/sc/tc/cjk）に:
- インストール方法
- 使用例
- フォント情報
- ライセンス（OFL-1.1）

参考: プランファイル Phase 6.2

### 4. 最終検証

```bash
# ビルド検証
pnpm download-fonts
pnpm build
pnpm typecheck

# テスト検証
pnpm test:ci

# Lint検証
pnpm lint
pnpm format:check

# パッケージpublish確認（dry-run）
pnpm --filter @noto-pdf-ts/core publish --dry-run
pnpm --filter @noto-pdf-ts/fonts-jp publish --dry-run
```

---

## 重要な技術的詳細

### Variable Fonts (VF) 使用

現在の実装は **Variable Fonts** を使用:
- `NotoSansJP-VF.ttf` (~9MB)
- `NotoSansCJK-VF.ttf.ttc` (~37MB)

元プランの`-Regular`版ではなく、VF版を使用することで:
- ✅ 1ファイルで複数ウェイト対応
- ✅ より柔軟なタイポグラフィ
- ⚠️ PDFiumのVFサポート確認が必要

### 循環依存の警告

`pnpm install`時に以下の警告が出る:
```
WARN  There are cyclic workspace dependencies:
  /workspaces/noto-pdf-ts/packages/core
  /workspaces/noto-pdf-ts/packages/fonts-cjk
```

**原因**:
- core → fonts-cjk (devDependency)
- fonts-cjk → core (peerDependency)

**影響**: 開発時のみ。本番では問題なし（devDependencyは含まれない）

### API破壊的変更

この移行は **major version (1.0.0)** リリース:

**変更点**:
- パッケージ名: `noto-pdf-ts` → `@noto-pdf-ts/core`
- フォント: 埋め込み → 別パッケージ
- API: `initLite()` → `init()`
- エントリポイント: `/lite`削除

---

## ファイル構造（現在）

```
/workspaces/noto-pdf-ts/
├── packages/
│   ├── core/                 (移行完了、テスト調整中)
│   ├── fonts-jp/            (完成)
│   ├── fonts-kr/            (完成)
│   ├── fonts-sc/            (完成)
│   ├── fonts-tc/            (完成)
│   └── fonts-cjk/           (完成)
├── fixtures/
│   ├── pdfs/                (既存)
│   └── fonts/               (✅ 新規作成、フォントコピー済み)
├── scripts/
│   ├── download-fonts.js    (完成)
│   └── copy-assets.js       (完成)
├── .github/workflows/
│   ├── ci.yml               (❌ 更新必要)
│   ├── release.yml          (❌ 更新必要)
│   ├── docs.yml
│   └── update-snapshots.yml
├── pnpm-workspace.yaml      (完成)
├── tsconfig.base.json       (完成)
├── package.json             (完成)
├── README.md                (❌ 削除されている、作成必要)
└── README_ja.md             (既存、更新不要？)
```

---

## チェックリスト

### Phase 4: テスト整合性
- [x] fixtures/fonts/作成
- [x] フォントコピー
- [x] fonts-cjk devDependency追加
- [x] sharp devDependency追加
- [ ] pnpm install実行
- [ ] テスト実行確認

### Phase 5: CI/CD
- [ ] ci.yml更新
- [ ] release.yml更新
- [ ] ワークフロー構文検証

### Phase 6: ドキュメント
- [ ] ルートREADME.md作成
- [ ] fonts-jp README更新
- [ ] fonts-kr README更新
- [ ] fonts-sc README更新
- [ ] fonts-tc README更新
- [ ] fonts-cjk README更新

### 最終検証
- [ ] pnpm build成功
- [ ] pnpm test成功
- [ ] pnpm typecheck成功
- [ ] pnpm lint成功
- [ ] publish dry-run成功
- [ ] CI実行確認

---

## 参考ドキュメント

- **プランファイル**: `/home/node/.claude/plans/spicy-napping-castle.md`
- **元の計画**: ユーザー提供のluminous-stargazing-graham.mdの内容
- **Git status**: 多数の変更がstaged（M）またはuntracked（?）

---

## 再開コマンド例

```bash
# 1. 依存関係インストール
pnpm install

# 2. テスト実行
pnpm --filter @noto-pdf-ts/core test:ci

# 問題なければ次のPhaseへ
# 3. CI/CD更新（ファイル編集）

# 4. ドキュメント作成（ファイル作成）

# 5. 最終検証
pnpm build
pnpm test:ci
pnpm lint
```

---

**注意**: 現在のgit状態は多数の変更が含まれています。作業再開前に`git status`で確認することを推奨します。
