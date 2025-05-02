import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  
  // キーボードイベントハンドラ
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                スレッド
              </button>
              {onEdit && (
                <button
                  onClick={handleEditStart}
                  className="text-xs text-gray-500 hover:text-primary p-1 md:p-0 flex items-center"
                  aria-label="編集"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  編集
                </button>
              )}
              <button
                onClick={() => onArchiveToggle(id)}
                className="text-xs text-gray-500 hover:text-primary p-1 md:p-0 flex items-center"
                aria-label={isArchived ? "アーカイブ解除" : "アーカイブ"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isArchived ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  )}
                </svg>
                {isArchived ? 'アーカイブ解除' : 'アーカイブ'}
              </button>
              {onTaskStatusToggle && (
                <button
                  onClick={() => onTaskStatusToggle(id)}
                  className="text-xs text-gray-500 hover:text-primary p-1 md:p-0 flex items-center"
                  aria-label={isTask ? "タスク解除" : "タスク化"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {isTask ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    )}
                  </svg>
                  {isTask ? 'タスク解除' : 'タスク化'}
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
        
        {/* 編集フォーム（編集モードの場合） */}
        {isEditing && (
          <div className="w-full">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
              autoFocus
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              タスクとして設定するには、テキストの先頭に[]を追加してください。
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
