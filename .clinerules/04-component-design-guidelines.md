# コンポーネント設計ガイドライン

このドキュメントは、コンポーネント設計に関するベストプラクティスと指針をまとめたものです。効率的で保守性の高いコンポーネントを設計するための原則と実践方法を定義します。

## 1. コンポーネント設計の基本原則

### 単一責任の原則
- **一つのコンポーネントは一つの責任を持つ**: 複数の役割を持つコンポーネントは分割する
- **適切な粒度**: 再利用性と可読性のバランスを考慮した粒度でコンポーネントを設計する
- **関心の分離**: 表示（UI）とロジックを適切に分離する

### 再利用性と拡張性
- **汎用性**: 特定のユースケースに依存しない汎用的なコンポーネントを設計する
- **プロパティによる制御**: コンポーネントの振る舞いはプロパティで制御できるようにする
- **デフォルト値の提供**: 必要に応じてプロパティにデフォルト値を設定する

### 一貫性
- **命名規則**: 一貫した命名規則を使用する（例：PascalCaseでコンポーネント名、camelCaseでプロパティ名）
- **インターフェース設計**: 類似したコンポーネント間で一貫したインターフェースを設計する
- **スタイリング**: 一貫したスタイリング手法を使用する

## 2. コード共有と再利用のパターン

### カスタムフックの活用
- **共通ロジックの抽出**: 複数のコンポーネントで使用するロジックはカスタムフックに抽出する
- **状態管理の分離**: UIとロジック/状態管理を分離する
- **テスト容易性**: フックは個別にテスト可能な形で設計する

### 具体的な実装例
```typescript
// 悪い例: 複数のコンポーネントで同じロジックを重複させる
function ComponentA() {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // undo/redoロジックの実装（重複）
  // ...
}

function ComponentB() {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // 同じundo/redoロジックの実装（重複）
  // ...
}

// 良い例: カスタムフックに抽出して再利用
function useHistory<T>(initialValue: T) {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);
  
  const setValue = useCallback((value: T) => {
    const newHistory = [...history.slice(0, historyIndex + 1), value];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  return {
    value: history[historyIndex],
    setValue,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}

// 使用例
function ComponentA() {
  const { value, setValue, undo, redo } = useHistory('');
  // ...
}

function ComponentB() {
  const { value, setValue, undo, redo } = useHistory('');
  // ...
}
```

### コンポーネントの合成
- **小さなコンポーネントの組み合わせ**: 複雑なUIは小さなコンポーネントの組み合わせで構築する
- **コンテキストの活用**: 深いプロパティのバケツリレーを避けるためにコンテキストを活用する
- **レンダープロップとchildren**: 柔軟性が必要な場合はレンダープロップやchildrenを活用する

## 3. 状態管理のベストプラクティス

### 状態の配置
- **最小限の状態**: 必要最小限の状態のみを保持する
- **適切なスコープ**: 状態を必要なスコープで管理する（コンポーネント内、コンテキスト、グローバルなど）
- **派生状態の計算**: 既存の状態から計算できる値は状態として持たない

### コンテキストの適切な使用
- **グローバル状態**: アプリケーション全体で共有する状態はコンテキストで管理する
- **関連する状態のグループ化**: 関連する状態と操作関数をまとめてコンテキストで提供する
- **コンテキストの分割**: 異なる更新頻度や目的の状態は別々のコンテキストに分割する

### 具体的な実装例
```typescript
// 悪い例: すべての状態を一つのコンテキストで管理
const AppContext = createContext<{
  messages: Message[];
  users: User[];
  settings: Settings;
  theme: Theme;
  // 多数の状態と操作関数
}>({});

// 良い例: 関連する状態ごとにコンテキストを分割
const MessageContext = createContext<{
  messages: Message[];
  addMessage: (content: string) => void;
  editMessage: (id: string, content: string) => void;
  // メッセージ関連の状態と操作
}>({});

const UIContext = createContext<{
  theme: Theme;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
  // UI関連の状態と操作
}>({});
```

## 4. パフォーマンス最適化

### 不要な再レンダリングの防止
- **メモ化**: `React.memo`、`useMemo`、`useCallback`を適切に使用する
- **状態の正規化**: 複雑なデータ構造は正規化して管理する
- **コンテキストの分割**: 更新頻度の異なる状態は別々のコンテキストに分割する

### レンダリング最適化
- **仮想化**: 大量のリスト項目は仮想化ライブラリを使用する
- **遅延読み込み**: 必要になるまでコンポーネントを読み込まない
- **条件付きレンダリング**: 必要な場合のみコンポーネントをレンダリングする

### 具体的な実装例
```typescript
// 悪い例: 不要な再レンダリング
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // 毎回新しい関数が作成される
  const handleClick = () => {
    console.log('Clicked');
  };
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ChildComponent onClick={handleClick} />
    </div>
  );
}

// 良い例: useCallbackでメモ化
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // 依存配列が空なので、関数は一度だけ作成される
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ChildComponent onClick={handleClick} />
    </div>
  );
}

// React.memoでコンポーネントをメモ化
const ChildComponent = React.memo(function ChildComponent({ onClick }) {
  console.log('ChildComponent rendered');
  return <button onClick={onClick}>Click me</button>;
});
```

## 5. ユーザー入力の処理

### フォーム管理
- **制御されたコンポーネント**: フォーム要素の値はReactの状態で管理する
- **バリデーション**: 入力値の検証は適切なタイミングで行う（リアルタイム、送信時など）
- **エラーハンドリング**: エラーメッセージは明確で具体的に表示する

### キーボード操作
- **ショートカットキー**: 一般的なショートカットキーをサポートする（⌘+Z/Ctrl+Z、⌘+Enter/Ctrl+Enterなど）
- **フォーカス管理**: キーボードナビゲーションを適切に処理する
- **アクセシビリティ**: キーボードのみでの操作をサポートする

### 具体的な実装例
```typescript
// キーボードショートカットの実装例
const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
  // ⌘+Enter / Ctrl+Enterでメッセージを送信
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    handleSubmit();
    return;
  }
  
  // ⌘+Z / Ctrl+Z でundo
  if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
    e.preventDefault();
    handleUndo();
    return;
  }
  
  // ⌘+Shift+Z / Ctrl+Shift+Z でredo
  if (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
    e.preventDefault();
    handleRedo();
    return;
  }
};
```

### モバイル対応
- **タッチ操作**: タッチ操作に最適化したUIを提供する
- **フォーカス維持**: モバイルでのフォーカス維持を適切に処理する
- **ソフトキーボード**: ソフトキーボード表示時の挙動を最適化する

## 6. DOM操作とレイアウト

### DOMの直接操作
- **refの使用**: DOMの直接操作が必要な場合は`useRef`を使用する
- **副作用の分離**: DOM操作は`useEffect`内で行う
- **タイミングの考慮**: DOM更新後の操作は`setTimeout`を使用するか、適切なタイミングで行う

### レイアウト制御
- **Flexboxの活用**: 柔軟なレイアウトにはFlexboxを活用する
- **グリッドの活用**: 複雑なグリッドレイアウトにはCSSグリッドを活用する
- **相対単位の使用**: ピクセル固定ではなく、相対単位（rem、em、%など）を使用する

### 具体的な実装例
```typescript
// カーソル位置の管理例
const textareaRef = useRef<HTMLTextAreaElement>(null);

const applyFormat = (formatType: FormatType) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const { value, selectionStart, selectionEnd } = textarea;
  const selectedText = value.substring(selectionStart, selectionEnd);
  let formattedText = '';
  let newCursorPos = selectionEnd;
  
  // フォーマット処理...
  
  // テキストを置き換え
  const newValue = value.substring(0, selectionStart) + formattedText + value.substring(selectionEnd);
  setMessage(newValue);
  
  // カーソル位置を更新（DOM更新後に実行するためsetTimeoutを使用）
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
};
```

## 7. レスポンシブデザインの実装

### デバイス対応の基本原則
- **モバイルファースト**: モバイル表示を基本として設計し、デスクトップ表示に拡張する
- **ブレイクポイントの一貫性**: プロジェクト全体で一貫したブレイクポイントを使用する
- **コンテンツの優先順位付け**: 画面サイズに応じてコンテンツの表示優先順位を調整する

### Tailwindを活用したレスポンシブ実装
- **レスポンシブクラス**: `md:hidden`や`md:block`などのTailwindのレスポンシブクラスを活用する
- **条件付きレンダリングの回避**: JSによる条件分岐よりもCSSのレスポンシブ機能を優先する
- **コメントの明確化**: コンポーネントの各部分の役割と表示条件を明確にコメントする

### 具体的な実装例
```tsx
// 悪い例: JavaScriptで条件分岐
function ResponsiveComponent() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}

// 良い例: Tailwindのレスポンシブクラスを活用
function ResponsiveComponent() {
  return (
    <div>
      {/* モバイル表示（デフォルト）- md以上の画面サイズでは非表示 */}
      <div className="block md:hidden">
        <MobileContent />
      </div>
      
      {/* デスクトップ表示 - デフォルトでは非表示、md以上の画面サイズで表示 */}
      <div className="hidden md:block">
        <DesktopContent />
      </div>
    </div>
  );
}
```

## 8. アクセシビリティの確保

### 基本原則
- **セマンティックHTML**: 適切なHTML要素を使用する（ボタンには`button`、リンクには`a`など）
- **ARIA属性**: 必要に応じてARIA属性を追加する
- **キーボードナビゲーション**: すべての機能はキーボードでアクセス可能にする

### フォーカス管理
- **フォーカスの視覚的表示**: フォーカス状態を視覚的に明確に表示する
- **フォーカストラップ**: モーダルやポップアップではフォーカストラップを実装する
- **フォーカスの復元**: モーダルを閉じた後は元の要素にフォーカスを戻す

### スクリーンリーダー対応
- **代替テキスト**: 画像には適切な代替テキストを提供する
- **ライブリージョン**: 動的に変化するコンテンツには`aria-live`属性を使用する
- **ラベル**: フォーム要素には明示的なラベルを関連付ける

## 9. テスト戦略

### ユニットテスト
- **コンポーネントのテスト**: UIコンポーネントの個別テスト
- **フックのテスト**: カスタムフックの個別テスト
- **モック**: 外部依存をモック化してテストを分離する

### 統合テスト
- **コンポーネント間の連携**: 複数のコンポーネントが連携する機能のテスト
- **ユーザーフロー**: 実際のユーザーフローに基づいたテスト
- **エッジケース**: 境界条件や例外ケースのテスト

### テスト駆動開発
- **テストファースト**: 実装前にテストを書く
- **小さな単位**: 小さな単位でテスト・実装・リファクタリングのサイクルを回す
- **継続的な実行**: テストを継続的に実行する

## 10. 今回のタスクからの学び

### 成功した点
- **カスタムフックの活用**: テキスト編集操作の履歴管理（undo/redo）を状態の配列と現在のインデックスで実装できた
- **DOM操作のタイミング制御**: `setTimeout`を使って非同期でカーソル位置を設定することで、DOM更新後の正確な位置設定が可能になった
- **条件付きクラス適用**: `${condition ? 'class1' : 'class2'}`のような条件付きクラス適用で、状態に応じたスタイリングを効果的に実現できた
- **Tailwindのレスポンシブクラス活用**: `hidden md:block`のようなTailwindのレスポンシブクラスを使用して、デバイスごとに最適なUIを提供できた

### 改善できる点
- **コードの重複**: `MessageInput.tsx`と`MessageItem.tsx`で重複するロジック（特にテキスト書式設定）をカスタムフックとして抽出すべきだった
- **テスト不足**: 実装した機能のテストが不足していた。特にエッジケース（長いテキスト、特殊文字を含むテキストなど）のテストが必要だった
- **パフォーマンス最適化**: 特にテキスト編集時の再レンダリングの最適化が不足していた。`useMemo`や`useCallback`を適切に使用すべきだった
- **ドキュメント不足**: 実装した機能の使い方や制限事項などのドキュメントが不足していた

### 今後の対応
- **共通ロジックのカスタムフック化**: テキスト書式設定のロジックを`useTextFormatting`のようなフックにまとめる
- **テスト強化**: ユニットテストを追加し、各機能が期待通りに動作することを確認する
- **パフォーマンス最適化**: 不要な再レンダリングを減らすため、`useMemo`や`useCallback`を適切に使用する
- **ドキュメント整備**: 実装した機能の使い方や制限事項などをREADMEファイルにまとめる

## まとめ

効果的なコンポーネント設計は、以下の原則に基づいています：

1. **単一責任**: 各コンポーネントは一つの責任のみを持つ
2. **再利用性**: 汎用的で再利用可能なコンポーネントを設計する
3. **一貫性**: 命名規則、インターフェース設計、スタイリングに一貫性を持たせる
4. **コード共有**: 共通ロジックはカスタムフックに抽出する
5. **状態管理**: 状態は適切なスコープで管理し、必要最小限に保つ
6. **パフォーマンス**: 不要な再レンダリングを防止し、レンダリングを最適化する
7. **ユーザー入力**: フォーム管理、キーボード操作、モバイル対応を適切に実装する
8. **DOM操作**: DOMの直接操作は`useRef`と`useEffect`を使用して適切に行う
9. **レスポンシブ**: CSSのレスポンシブ機能を活用し、デバイスごとに最適なUIを提供する
10. **アクセシビリティ**: セマンティックHTML、ARIA属性、キーボードナビゲーションを適切に実装する

これらの原則を守ることで、保守性が高く、パフォーマンスの良い、ユーザーフレンドリーなコンポーネントを設計することができます。
