import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  replyToId?: string;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  replyToId,
  placeholder = 'メッセージを入力...'
}) => {
  const [message, setMessage] = useState('');
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
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
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
            {replyToId ? '返信を作成中...' : 'Markdownが使用できます | ⌘+Enter / Ctrl+Enterで送信'}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="px-4 py-1 bg-primary text-white rounded-md disabled:opacity-50 text-base"
          >
            送信
          </button>
        </div>
      </div>
      
      {/* モバイル表示用の送信ボタン（md未満の画面サイズで表示、右下に固定） */}
      <button
        onClick={handleSubmit}
        disabled={!message.trim()}
        className="md:hidden fixed bottom-4 right-4 w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full shadow-lg disabled:opacity-50 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;
