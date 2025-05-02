# IO - 技術コンテキスト

## 使用技術

### コア技術

- **Next.js** - Reactベースのフレームワーク
- **React** - UIライブラリ
- **Tailwind CSS** - ユーティリティファーストCSSフレームワーク
- **LocalStorage** - クライアントサイドデータ保存

### 補助技術

- **React Markdown** - マークダウンレンダリング
- **date-fns** - 日付操作
- **uuid** - 一意のID生成

## 開発環境

### 必要なツール

- **Node.js** - v22.x以上
- **npm** または **yarn** - パッケージ管理
- **Git** - バージョン管理

### 推奨開発ツール

- **Visual Studio Code** - コードエディタ
  - Biome拡張機能
  - Tailwind CSS IntelliSense拡張機能
- **Chrome DevTools** - デバッグとパフォーマンス分析

## プロジェクトセットアップ

### 初期セットアップ

```bash
# プロジェクト作成
npx create-next-app io-app --typescript

# 依存関係のインストール
cd io-app
npm install react-markdown date-fns uuid
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Biomeのインストール
npm install -D @biomejs/biome

# Vitestのインストール
npm install -D vitest @vitejs/plugin-react
```

### Biome設定

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.0.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

### Tailwind CSS設定

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // カスタムテーマ設定
      colors: {
        primary: '#3490dc',
        secondary: '#ffed4a',
        danger: '#e3342f',
      },
    },
  },
  plugins: [],
}
```

### ディレクトリ構造

```
io-app/
├── components/       # UIコンポーネント
│   ├── layout/       # レイアウト関連コンポーネント
│   ├── message/      # メッセージ関連コンポーネント
│   ├── thread/       # スレッド関連コンポーネント
│   └── tag/          # タグ関連コンポーネント
├── contexts/         # Reactコンテキスト
├── hooks/            # カスタムフック
├── pages/            # Next.jsページ
├── public/           # 静的ファイル
├── styles/           # グローバルスタイル
└── utils/            # ユーティリティ関数
```

## 技術的制約

### クライアントサイドの制約

- **データ永続化** - LocalStorageの容量制限（通常5MB程度）
- **オフライン対応** - 基本的なオフライン対応のみ
- **パフォーマンス** - 大量のメッセージ処理時の最適化が必要

### ブラウザ互換性

- **モダンブラウザ対応** - Chrome, Firefox, Safari, Edge最新版
- **レガシーブラウザ** - IE11は非対応

## 開発プラクティス

### コーディング規約

- **TypeScript** - 型安全性の確保
- **Biome** - コード品質の維持とフォーマット統一
  - リンティング
  - フォーマッティング
  - インポートの整理

### テスト戦略

- **Vitest** - ユニットテストとコンポーネントテスト
  - React Testing Libraryとの統合
  - 高速な実行速度
- **Cypress** - E2Eテスト（将来的に）

## デプロイメント

### デモ段階

- **Vercel** または **Netlify** - 静的サイトホスティング
- **GitHub Pages** - 簡易デプロイオプション

### 将来的な本番環境

- **Vercel** - Next.jsの最適化されたホスティング
- **AWS** または **GCP** - スケーラブルなインフラ（必要に応じて）

## パフォーマンス最適化

- **コンポーネントの最適化** - React.memo, useMemo, useCallbackの適切な使用
- **画像最適化** - Next.jsの画像最適化機能の活用
- **コード分割** - 動的インポートによる初期ロード時間の短縮
- **レンダリング最適化** - 不要な再レンダリングの防止

## セキュリティ考慮事項

- **XSS対策** - マークダウンレンダリング時の安全な処理
- **CORS** - 将来的なAPI実装時の適切な設定
- **データ検証** - ユーザー入力の適切な検証

## アクセシビリティ

- **WAI-ARIA** - アクセシブルなUIコンポーネント
- **キーボードナビゲーション** - キーボードでの操作性確保
- **スクリーンリーダー対応** - 適切なラベルと構造
