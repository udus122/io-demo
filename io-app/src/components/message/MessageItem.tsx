import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MessageItemProps {
  id: string;
  content: string;
  createdAt: Date;
  tags: string[];
  isArchived: boolean;
  hasThread: boolean;
  onReply: (id: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  id,
  content,
  createdAt,
  tags,
  isArchived,
  hasThread,
  onReply,
  onTagClick,
  onArchiveToggle,
}) => {
  return (
    <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isArchived ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}`}>
      {/* メッセージヘッダー */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {format(createdAt, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onReply(id)}
            className="text-xs text-gray-500 hover:text-primary"
          >
            返信
          </button>
          <button
            onClick={() => onArchiveToggle(id)}
            className="text-xs text-gray-500 hover:text-primary"
          >
            {isArchived ? 'アーカイブ解除' : 'アーカイブ'}
          </button>
        </div>
      </div>

      {/* メッセージ本文 */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
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
            スレッドを表示
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
