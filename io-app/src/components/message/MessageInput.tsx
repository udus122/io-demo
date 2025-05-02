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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex flex-col rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-3 resize-none focus:outline-none bg-transparent"
          rows={3}
        />
        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {replyToId ? '返信を作成中...' : 'Markdownが使用できます'}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="px-4 py-1 bg-primary text-white rounded-md disabled:opacity-50"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
