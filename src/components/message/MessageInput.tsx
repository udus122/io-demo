import React, { useState, KeyboardEvent, useRef, useEffect, MouseEvent, useCallback } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  replyToId?: string;
  placeholder?: string;
  taskFilter?: string;
}

// アイコンコンポーネント
const SendIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.5 12L4.5 4.5l2 7.5-2 7.5 17-7.5z M4.5 12h5" />
  </svg>
);

const BoldIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 0 0 0-8H6v8zm0 0h10a4 4 0 0 1 0 8H6v-8z" />
  </svg>
);

const ItalicIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h4m-4 12h4M8 6l8 12" />
  </svg>
);

const StrikethroughIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12M9 6v12m6-12v12" />
    <line x1="6" y1="12" x2="18" y2="12" strokeWidth={2} />
  </svg>
);

const UnderlineIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6v6a4 4 0 0 0 8 0V6M6 18h12" />
  </svg>
);

const ListBulletIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="2" cy="6" r="1" fill="currentColor" />
    <circle cx="2" cy="12" r="1" fill="currentColor" />
    <circle cx="2" cy="18" r="1" fill="currentColor" />
  </svg>
);

const ListNumberIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    <text x="1" y="7" fontSize="6" fill="currentColor">1</text>
    <text x="1" y="13" fontSize="6" fill="currentColor">2</text>
    <text x="1" y="19" fontSize="6" fill="currentColor">3</text>
  </svg>
);

const IndentIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h12M3 17h12" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12l-3-3m0 6v-6" fill="none" />
  </svg>
);

const OutdentIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M9 12h12M9 17h12" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l3-3m0 6V9" fill="none" />
</svg>
);

// フォーマットタイプの定義
type FormatType = 
  | 'bold' 
  | 'italic' 
  | 'strikethrough' 
  | 'underline' 
  | 'bulletList' 
  | 'numberList' 
  | 'indent' 
  | 'outdent';

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  replyToId,
  placeholder = 'メッセージを入力...',
  taskFilter = 'all'
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // undo/redo用の履歴管理
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = useState(false);
  
  // メッセージが変更されたときに履歴を更新
  useEffect(() => {
    if (!isUndoRedoing) {
      // 通常の編集操作の場合のみ履歴を更新
      const newHistory = [...history.slice(0, historyIndex + 1), message];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    // isUndoRedoingをリセット
    setIsUndoRedoing(false);
  }, [message]);
  
  // undo操作
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedoing(true);
      setHistoryIndex(historyIndex - 1);
      setMessage(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);
  
  // redo操作
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoing(true);
      setHistoryIndex(historyIndex + 1);
      setMessage(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // テキストにフォーマットを適用する関数
  const applyFormat = (formatType: FormatType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { value, selectionStart, selectionEnd } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    let formattedText = '';
    let newCursorPos = selectionEnd;
    
    // 現在行の開始位置と終了位置を取得（インデント/アウトデント用）
    const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLineEnd = value.indexOf('\n', selectionStart);
    const lineEnd = currentLineEnd === -1 ? value.length : currentLineEnd;
    const currentLine = value.substring(currentLineStart, lineEnd);
    
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = selectionStart === selectionEnd 
          ? selectionStart + 2 // カーソルのみの場合は**の間にカーソルを置く
          : selectionEnd + 4; // テキスト選択時は選択範囲の後ろにカーソルを置く
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = selectionStart === selectionEnd 
          ? selectionStart + 1 
          : selectionEnd + 2;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        newCursorPos = selectionStart === selectionEnd 
          ? selectionStart + 2 
          : selectionEnd + 4;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        newCursorPos = selectionStart === selectionEnd 
          ? selectionStart + 3 
          : selectionEnd + 7;
        break;
      case 'bulletList':
        // 選択範囲がある場合は各行に箇条書きを適用またはトグル
        if (selectionStart !== selectionEnd) {
          const lines = selectedText.split('\n');
          formattedText = lines.map(line => {
            // 既に箇条書きの場合は削除、そうでなければ追加
            const bulletPattern = /^(\s*)- (.*)$/;
            const match = line.match(bulletPattern);
            
            if (match) {
              // 箇条書きを削除
              return `${match[1]}${match[2]}`;
            } else {
              // 箇条書きを追加（先頭のスペースを維持）
              const leadingSpacePattern = /^(\s*)(.*)/;
              const spaceMatch = line.match(leadingSpacePattern);
              return spaceMatch ? `${spaceMatch[1]}- ${spaceMatch[2]}` : `- ${line}`;
            }
          }).join('\n');
          newCursorPos = selectionStart + formattedText.length;
        } else {
          // 選択範囲がない場合は現在行のリスト形式を切り替え
          const bulletPattern = /^(\s*)- (.*)$/;
          const numberPattern = /^(\s*)(\d+)\. (.*)$/;
          const bulletMatch = currentLine.match(bulletPattern);
          const numberMatch = currentLine.match(numberPattern);
          
          // 先頭のスペースを検出
          const leadingSpacePattern = /^(\s*)(.*)/;
          const spaceMatch = currentLine.match(leadingSpacePattern);
          const leadingSpace = spaceMatch ? spaceMatch[1] : '';
          
          if (bulletMatch) {
            // 箇条書きを削除
            const newLine = `${bulletMatch[1]}${bulletMatch[2]}`;
            const newValue = value.substring(0, currentLineStart) + newLine + value.substring(lineEnd);
            setMessage(newValue);
            // カーソル位置を調整（箇条書きマークの分だけ戻す）
            const newPosition = selectionStart - 2;
            setTimeout(() => {
              textarea.setSelectionRange(newPosition, newPosition);
            }, 0);
          } else if (numberMatch) {
            // 番号付きリストを箇条書きに変換
            const content = numberMatch[3];
            formattedText = `${numberMatch[1]}- ${content}`;
            const newValue = value.substring(0, currentLineStart) + formattedText + value.substring(lineEnd);
            setMessage(newValue);
            // カーソル位置を調整
            const offset = 2 - (numberMatch[2].length + 2); // 「- 」の長さ - 「n. 」の長さ
            const newPosition = selectionStart + offset;
            setTimeout(() => {
              textarea.setSelectionRange(newPosition, newPosition);
            }, 0);
          } else {
            // 箇条書きを追加（先頭のスペースを維持）
            formattedText = `${leadingSpace}- `;
            const newValue = value.substring(0, currentLineStart) + formattedText + 
                            value.substring(currentLineStart + leadingSpace.length);
            setMessage(newValue);
            // カーソル位置を調整（元の位置に対してリストマークの長さ分オフセット）
            const newPosition = selectionStart + 2; // 「- 」の長さは2
            setTimeout(() => {
              textarea.setSelectionRange(newPosition, newPosition);
            }, 0);
          }
          return;
        }
        break;
      case 'numberList':
        // 選択範囲がある場合は各行に番号付きリストを適用またはトグル
        if (selectionStart !== selectionEnd) {
          const lines = selectedText.split('\n');
          formattedText = lines.map((line, index) => {
            // 既に番号付きリストの場合は削除、そうでなければ追加
            const numberPattern = /^(\s*)(\d+)\. (.*)$/;
            const match = line.match(numberPattern);
            
            if (match) {
              // 番号付きリストを削除
              return `${match[1]}${match[3]}`;
            } else {
              // 番号付きリストを追加（先頭のスペースを維持）
              const leadingSpacePattern = /^(\s*)(.*)/;
              const spaceMatch = line.match(leadingSpacePattern);
              return spaceMatch ? `${spaceMatch[1]}${index + 1}. ${spaceMatch[2]}` : `${index + 1}. ${line}`;
            }
          }).join('\n');
          newCursorPos = selectionStart + formattedText.length;
        } else {
          // 選択範囲がない場合は現在行のリスト形式を切り替え
          const bulletPattern = /^(\s*)- (.*)$/;
          const numberPattern = /^(\s*)(\d+)\. (.*)$/;
          const bulletMatch = currentLine.match(bulletPattern);
          const numberMatch = currentLine.match(numberPattern);
          
          // 先頭のスペースを検出
          const leadingSpacePattern = /^(\s*)(.*)/;
          const spaceMatch = currentLine.match(leadingSpacePattern);
          const leadingSpace = spaceMatch ? spaceMatch[1] : '';
          
          if (numberMatch) {
            // 番号付きリストを削除
            const newLine = `${numberMatch[1]}${numberMatch[3]}`;
            const newValue = value.substring(0, currentLineStart) + newLine + value.substring(lineEnd);
            setMessage(newValue);
            // カーソル位置を調整（番号付きリストマークの分だけ戻す）
            const newPosition = selectionStart - (numberMatch[2].length + 2);
            setTimeout(() => {
              textarea.setSelectionRange(newPosition, newPosition);
            }, 0);
          } else if (bulletMatch) {
            // 箇条書きを番号付きリストに変換
            const content = bulletMatch[2];
            formattedText = `${bulletMatch[1]}1. ${content}`;
            const newValue = value.substring(0, currentLineStart) + formattedText + value.substring(lineEnd);
            setMessage(newValue);
            // カーソル位置を調整
            const offset = 3 - 2; // 「1. 」の長さ - 「- 」の長さ
            const newPosition = selectionStart + offset;
            setTimeout(() => {
              textarea.setSelectionRange(newPosition, newPosition);
            }, 0);
          } else {
            // 番号付きリストを追加（先頭のスペースを維持）
            formattedText = `${leadingSpace}1. `;
            const newValue = value.substring(0, currentLineStart) + formattedText + 
                            value.substring(currentLineStart + leadingSpace.length);
            setMessage(newValue);
            // カーソル位置を調整（元の位置に対してリストマークの長さ分オフセット）
            const newPosition = selectionStart + 3; // 「1. 」の長さは3
            setTimeout(() => {
              textarea.setSelectionRange(newPosition, newPosition);
            }, 0);
          }
          return;
        }
        break;
      case 'indent':
        // 箇条書きの行にインデントを適用
        const listPattern = /^(\s*)(-|\*|\+|(\d+)\.) (.*)$/;
        const match = currentLine.match(listPattern);
        
        if (match) {
          // インデント（スペース2つを追加）
          const newLine = '  ' + currentLine;
          const newValue = value.substring(0, currentLineStart) + newLine + value.substring(lineEnd);
          setMessage(newValue);
          
          // カーソル位置を調整
          const newPosition = selectionStart + 2;
          setTimeout(() => {
            textarea.setSelectionRange(newPosition, newPosition);
          }, 0);
          return;
        }
        return;
      case 'outdent':
        // 箇条書きの行からインデントを削除
        const outdentPattern = /^(\s*)(-|\*|\+|(\d+)\.) (.*)$/;
        const outdentMatch = currentLine.match(outdentPattern);
        
        if (outdentMatch) {
          const [, indent] = outdentMatch;
          if (indent.length >= 2) {
            // 先頭から2つのスペースを削除
            const newLine = currentLine.substring(2);
            const newValue = value.substring(0, currentLineStart) + newLine + value.substring(lineEnd);
            setMessage(newValue);
            
            // カーソル位置を調整
            const newPosition = Math.max(selectionStart - 2, currentLineStart);
            setTimeout(() => {
              textarea.setSelectionRange(newPosition, newPosition);
            }, 0);
          }
          return;
        }
        return;
      default:
        return;
    }
    
    // テキストを置き換え
    const newValue = value.substring(0, selectionStart) + formattedText + value.substring(selectionEnd);
    setMessage(newValue);
    
    // カーソル位置を更新
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // フォーマットボタンをクリックしたときの処理
  const handleFormatClick = (formatType: FormatType, e: MouseEvent<HTMLButtonElement>) => {
    // デフォルトのボタンクリック動作を防止（フォーカスが外れるのを防ぐ）
    e.preventDefault();
    
    applyFormat(formatType);
    
    // フォーマット適用後、テキストエリアにフォーカスを戻す
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };
  
  // テキストエリアの高さを内容に合わせて自動調整する関数
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 一度高さをリセットして正確な scrollHeight を取得
      textarea.style.height = '0px';
      // scrollHeight に基づいて高さを設定（最小高さは3行分）
      const minHeight = 72; // 3行分の高さ（おおよその値）
      const newHeight = Math.max(textarea.scrollHeight, minHeight);
      textarea.style.height = `${newHeight}px`;
    }
  };
  
  // メッセージが変更されたときに高さを調整
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = () => {
    if (message.trim()) {
      // タスクフィルターが選択されている場合、自動的にタスクメッセージとして送信
      let content = message;
      if (taskFilter === 'tasks' || taskFilter === 'uncompleted-tasks' || taskFilter === 'completed-tasks') {
        // メッセージが既にタスク形式（[]または[x]で始まる）でない場合のみ、先頭にマークを追加
        const trimmedContent = content.trim();
        if (!trimmedContent.startsWith('[]') && !trimmedContent.startsWith('[x]')) {
          // 「完了済タスクのみ」の場合は[x]を追加、それ以外は[]を追加
          if (taskFilter === 'completed-tasks') {
            content = `[x]${content}`;
          } else {
            content = `[]${content}`;
          }
        }
      }
      onSendMessage(content);
      setMessage('');
    }
  };

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
    
    // ⌘+B / Ctrl+B で太字
    if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      applyFormat('bold');
      return;
    }
    
    // ⌘+I / Ctrl+I で斜体
    if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      applyFormat('italic');
      return;
    }
    
    // ⌘+U / Ctrl+U で下線
    if (e.key === 'u' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      applyFormat('underline');
      return;
    }
    
    // ⌘+X / Ctrl+X で取り消し線（選択範囲がある場合のみ）
    if (e.key === 'x' && (e.metaKey || e.ctrlKey) && e.currentTarget.selectionStart !== e.currentTarget.selectionEnd) {
      e.preventDefault();
      applyFormat('strikethrough');
      return;
    }

    // Tabキーによるインデント/アウトデント機能
    if (e.key === 'Tab') {
      e.preventDefault(); // デフォルトのフォーカス移動を防止
      
      const textarea = e.currentTarget;
      const { value, selectionStart, selectionEnd } = textarea;
      
      // 現在行の開始位置と終了位置を取得
      const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLineEnd = value.indexOf('\n', selectionStart);
      const lineEnd = currentLineEnd === -1 ? value.length : currentLineEnd;
      
      // 現在行のテキスト
      const currentLine = value.substring(currentLineStart, lineEnd);
      
      // マークダウンリスト記号のパターン
      const listPattern = /^(\s*)(-|\*|\+|(\d+)\.) (.*)$/;
      const match = currentLine.match(listPattern);
      
      if (match) {
        if (e.shiftKey) {
          // Shift+Tab: アウトデント（スペース2つを削除）
          const [, indent] = match;
          if (indent.length >= 2) {
            // 先頭から2つのスペースを削除
            const newLine = currentLine.substring(2);
            const newValue = value.substring(0, currentLineStart) + newLine + value.substring(lineEnd);
            setMessage(newValue);
            
            // カーソル位置を調整
            const newPosition = Math.max(selectionStart - 2, currentLineStart);
            setTimeout(() => {
              textarea.setSelectionRange(newPosition, newPosition);
            }, 0);
          }
        } else {
          // Tab: インデント（スペース2つを追加）
          const newLine = '  ' + currentLine;
          const newValue = value.substring(0, currentLineStart) + newLine + value.substring(lineEnd);
          setMessage(newValue);
          
          // カーソル位置を調整
          const newPosition = selectionStart + 2;
          setTimeout(() => {
            textarea.setSelectionRange(newPosition, newPosition);
          }, 0);
        }
      }
      return;
    }

    // マークダウンリスト自動継続機能
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      const textarea = e.currentTarget;
      const { value, selectionStart } = textarea;
      
      // 現在行の開始位置を取得
      const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      // 現在行のテキストを取得
      const currentLine = value.substring(currentLineStart, selectionStart);
      
      // マークダウンリスト記号のパターン
      const listPattern = /^(\s*)(-|\*|\+|(\d+)\.) (\S+.*)?$/;
      const match = currentLine.match(listPattern);
      
      if (match) {
        const [, indent, marker, number, content] = match;
        
        // 空のリスト項目の場合はリストを終了
        if (!content) {
          e.preventDefault();
          const newValue = value.substring(0, currentLineStart) + value.substring(selectionStart);
          setMessage(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(currentLineStart, currentLineStart);
          }, 0);
          return;
        }
        
        // 次の行に同じリスト記号を挿入
        e.preventDefault();
        
        // 番号付きリストの場合は番号をインクリメント
        let nextMarker = marker;
        if (number) {
          const nextNumber = parseInt(number) + 1;
          nextMarker = nextNumber + '.';
        }
        
        const insertion = `\n${indent}${nextMarker} `;
        const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionStart);
        setMessage(newValue);
        
        // カーソル位置を更新
        const newPosition = selectionStart + insertion.length;
        setTimeout(() => {
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      }
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-2 md:p-4 bg-white dark:bg-gray-800">
      {/* フォーマットボタンツールバー */}
      <div className="flex flex-wrap gap-1 mb-2 overflow-x-auto pb-1">
        <button
          onClick={(e) => handleFormatClick('bold', e)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="太字"
          aria-label="太字"
        >
          <BoldIcon />
        </button>
        <button
          onClick={(e) => handleFormatClick('italic', e)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="斜体"
          aria-label="斜体"
        >
          <ItalicIcon />
        </button>
        <button
          onClick={(e) => handleFormatClick('underline', e)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="下線"
          aria-label="下線"
        >
          <UnderlineIcon />
        </button>
        <button
          onClick={(e) => handleFormatClick('strikethrough', e)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="取り消し線"
          aria-label="取り消し線"
        >
          <StrikethroughIcon />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
        <button
          onClick={(e) => handleFormatClick('bulletList', e)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="箇条書き"
          aria-label="箇条書き"
        >
          <ListBulletIcon />
        </button>
        <button
          onClick={(e) => handleFormatClick('numberList', e)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="番号付きリスト"
          aria-label="番号付きリスト"
        >
          <ListNumberIcon />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
        <button
          onClick={(e) => handleFormatClick('outdent', e)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="アウトデント"
          aria-label="アウトデント"
        >
          <OutdentIcon />
        </button>
        <button
          onClick={(e) => handleFormatClick('indent', e)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="インデント"
          aria-label="インデント"
        >
          <IndentIcon />
        </button>
      </div>
      
      <div className="flex flex-col rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-2 md:p-3 resize-none focus:outline-none bg-transparent min-h-[72px]"
          style={{ overflow: 'hidden' }}
        />
        {/* デスクトップ表示用のコントロールエリア（md以上の画面サイズで表示） */}
        <div className="hidden md:flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {replyToId ? '返信を作成中...' : 'テキストの先頭に[]を追加するとタスクになります。 | ⌘+Enter / Ctrl+Enterで送信'}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="p-2 bg-primary text-white rounded-md disabled:opacity-50 flex items-center justify-center"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* モバイル表示用の送信ボタン（md未満の画面サイズで表示、右下に固定） */}
      <button
        onClick={handleSubmit}
        disabled={!message.trim()}
        className="md:hidden fixed bottom-4 right-4 w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full shadow-lg disabled:opacity-50 z-10"
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default MessageInput;
