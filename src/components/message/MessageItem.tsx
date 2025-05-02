import React, { useState, useRef, useEffect, MouseEvent, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MessageItemProps {
  id: string;
  content: string;
  createdAt: Date;
  tags: string[];
  isArchived: boolean;
  isTask?: boolean;
  isCompleted?: boolean;
  hasThread: boolean;
  replyCount?: number;
  onReply: (id: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
  onTaskToggle?: (id: string) => void;
  onTaskStatusToggle?: (id: string) => void;
  onEdit?: (id: string, newContent: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  id,
  content,
  createdAt,
  tags,
  isArchived,
  isTask = false,
  isCompleted = false,
  hasThread,
  replyCount,
  onReply,
  onTagClick,
  onArchiveToggle,
  onTaskToggle,
  onTaskStatusToggle,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [editContent, isEditing]);
  
  // 編集を開始
  const handleEditStart = () => {
    setEditContent(isTask ? `[]${content}` : content);
    setIsEditing(true);
  };
  
  // 編集を保存
  const handleSave = () => {
    if (onEdit && editContent.trim()) {
      onEdit(id, editContent);
    }
    setIsEditing(false);
  };
  
  // 編集をキャンセル
  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(content);
  };
  
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
            setEditContent(newValue);
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
            setEditContent(newValue);
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
            setEditContent(newValue);
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
            setEditContent(newValue);
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
            setEditContent(newValue);
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
            setEditContent(newValue);
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
          setEditContent(newValue);
          
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
            setEditContent(newValue);
            
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
    setEditContent(newValue);
    
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
  
  // キーボードイベントハンドラ
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // ⌘+Enter / Ctrl+Enterで保存
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
      return;
    }
    
    // Escapeで編集キャンセル
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
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
  };
  return (
    <div className={`p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 ${isArchived ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}`}>
      {/* メッセージヘッダー */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {format(createdAt, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
        </div>
        <div className="flex space-x-1 md:space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={() => onReply(id)}
                className="text-xs text-gray-500 hover:text-primary p-1 md:p-0 flex items-center"
                aria-label="スレッド"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden md:inline">スレッド</span>
              </button>
              {onEdit && (
                <button
                  onClick={handleEditStart}
                  className="text-xs text-gray-500 hover:text-primary p-1 md:p-0 flex items-center"
                  aria-label="編集"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden md:inline">編集</span>
                </button>
              )}
              <button
                onClick={() => onArchiveToggle(id)}
                className="text-xs text-gray-500 hover:text-primary p-1 md:p-0 flex items-center"
                aria-label={isArchived ? "アーカイブ解除" : "アーカイブ"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isArchived ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  )}
                </svg>
                <span className="hidden md:inline">{isArchived ? 'アーカイブ解除' : 'アーカイブ'}</span>
              </button>
              {onTaskStatusToggle && (
                <button
                  onClick={() => onTaskStatusToggle(id)}
                  className="text-xs text-gray-500 hover:text-primary p-1 md:p-0 flex items-center"
                  aria-label={isTask ? "タスク解除" : "タスク化"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {isTask ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    )}
                  </svg>
                  <span className="hidden md:inline">{isTask ? 'タスク解除' : 'タスク化'}</span>
                </button>
              )}
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                className="text-xs text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 p-1 md:p-0"
              >
                保存
              </button>
              <button
                onClick={handleCancel}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 p-1 md:p-0"
              >
                キャンセル
              </button>
            </>
          )}
        </div>
      </div>

      {/* メッセージ本文 */}
      <div className="flex">
        {/* タスクチェックボックス */}
        {isTask && onTaskToggle && !isEditing && (
          <div className="mr-2 mt-1">
            <button
              onClick={() => onTaskToggle(id)}
              className="w-5 h-5 border rounded flex items-center justify-center"
              aria-label={isCompleted ? "タスク完了を解除" : "タスクを完了としてマーク"}
            >
              {isCompleted && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        )}
        
        {/* メッセージコンテンツ（編集モードでない場合） */}
        {!isEditing && (
          <div className={`prose prose-sm dark:prose-invert max-w-none ${isTask && isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
          </div>
        )}
        
        {/* 編集フォーム（編集モードの場合） */}
        {isEditing && (
          <div className="w-full">
            {/* フォーマットボタンツールバー */}
            <div className="flex flex-wrap gap-1 mb-2 overflow-x-auto pb-1">
              <button
                onClick={(e) => handleFormatClick('bold', e)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="太字"
                aria-label="太字"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 0 0 0-8H6v8zm0 0h10a4 4 0 0 1 0 8H6v-8z" />
                </svg>
              </button>
              <button
                onClick={(e) => handleFormatClick('italic', e)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="斜体"
                aria-label="斜体"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h4m-4 12h4M8 6l8 12" />
                </svg>
              </button>
              <button
                onClick={(e) => handleFormatClick('underline', e)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="下線"
                aria-label="下線"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6v6a4 4 0 0 0 8 0V6M6 18h12" />
                </svg>
              </button>
              <button
                onClick={(e) => handleFormatClick('strikethrough', e)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="取り消し線"
                aria-label="取り消し線"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12M9 6v12m6-12v12" />
                  <line x1="6" y1="12" x2="18" y2="12" strokeWidth={2} />
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
              <button
                onClick={(e) => handleFormatClick('bulletList', e)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="箇条書き"
                aria-label="箇条書き"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  <circle cx="2" cy="6" r="1" fill="currentColor" />
                  <circle cx="2" cy="12" r="1" fill="currentColor" />
                  <circle cx="2" cy="18" r="1" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={(e) => handleFormatClick('numberList', e)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="番号付きリスト"
                aria-label="番号付きリスト"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  <text x="1" y="7" fontSize="6" fill="currentColor">1</text>
                  <text x="1" y="13" fontSize="6" fill="currentColor">2</text>
                  <text x="1" y="19" fontSize="6" fill="currentColor">3</text>
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
              <button
                onClick={(e) => handleFormatClick('outdent', e)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="アウトデント"
                aria-label="アウトデント"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M9 12h12M9 17h12" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l3-3m0 6V9" fill="none" />
                </svg>
              </button>
              <button
                onClick={(e) => handleFormatClick('indent', e)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="インデント"
                aria-label="インデント"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h12M3 17h12" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12l-3-3m0 6v-6" fill="none" />
                </svg>
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              style={{ minHeight: '72px', overflow: 'hidden' }}
              autoFocus
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              テキストの先頭に[]を追加するとタスクになります。
              ⌘+Enter / Ctrl+Enterで保存。
            </div>
          </div>
        )}
      </div>

      {/* タグとスレッド情報 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs"
          >
            #{tag}
          </button>
        ))}
        
        {hasThread && (
          <div className="ml-auto text-xs text-primary cursor-pointer" onClick={() => onReply(id)}>
            スレッドを表示 {replyCount && `(${replyCount})`}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
