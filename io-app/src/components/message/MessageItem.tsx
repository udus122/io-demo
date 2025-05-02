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
  isTask?: boolean;
  isCompleted?: boolean;
  hasThread: boolean;
  onReply: (id: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
  onTaskToggle?: (id: string) => void;
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
  onReply,
  onTagClick,
  onArchiveToggle,
  onTaskToggle,
}) => {
  return (
    <div className={`p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 ${isArchived ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}`}>
      {/* メッセージヘッダー */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {format(createdAt, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
        </div>
        <div className="flex space-x-1 md:space-x-2">
          <button
            onClick={() => onReply(id)}
            className="text-xs text-gray-500 hover:text-primary p-1 md:p-0"
          >
            返信
          </button>
          <button
            onClick={() => onArchiveToggle(id)}
            className="text-xs text-gray-500 hover:text-primary p-1 md:p-0"
          >
            {isArchived ? 'アーカイブ解除' : 'アーカイブ'}
          </button>
        </div>
      </div>

      {/* メッセージ本文 */}
      <div className="flex">
        {/* タスクチェックボックス */}
        {isTask && onTaskToggle && (
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
        
        {/* メッセージコンテンツ */}
        <div className={`prose prose-sm dark:prose-invert max-w-none ${isTask && isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
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
