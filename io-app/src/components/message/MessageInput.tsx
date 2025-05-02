import React, { useState, KeyboardEvent } from 'react';

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
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-2 md:p-3 resize-none focus:outline-none bg-transparent"
          rows={3}
        />
        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700">
          <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
            {replyToId ? '返信を作成中...' : 'Markdownが使用できます | ⌘+Enter / Ctrl+Enterで送信'}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="px-3 py-1 md:px-4 md:py-1 bg-primary text-white rounded-md disabled:opacity-50 text-sm md:text-base"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
