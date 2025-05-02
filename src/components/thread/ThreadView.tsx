import React, { useRef, useEffect, useState } from 'react';
import MessageItem from '../message/MessageItem';
import { Message } from '@/types';
import { useMessages } from '@/contexts/MessageContext';

interface ThreadViewProps {
  parentMessage: Message | null;
  replies: Message[];
  onSendReply: (content: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
  onTaskToggle?: (id: string) => void;
  onTaskStatusToggle?: (id: string) => void;
  onClose: () => void;
}

// スレッドヘッダーコンポーネント
export const ThreadHeader: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
      <div className="flex items-center">
        {/* モバイル用の戻るボタン */}
        <button
          onClick={onClose}
          className="md:hidden mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center"
          aria-label="戻る"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden md:inline">戻る</span>
        </button>
        <h2 className="font-semibold">スレッド</h2>
      </div>
      {/* デスクトップ用の閉じるボタン */}
      <button
        onClick={onClose}
        className="hidden md:block text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        aria-label="閉じる"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const ThreadView: React.FC<ThreadViewProps> = ({
  parentMessage,
  replies,
  onSendReply,
  onTagClick,
  onArchiveToggle,
  onTaskToggle,
  onTaskStatusToggle,
  onClose,
}) => {
  const { lastAddedMessageId, editMessage } = useMessages();
  const repliesEndRef = useRef<HTMLDivElement>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // 新しい返信が追加されたときとコンポーネントマウント時にスクロールする
  useEffect(() => {
    if (repliesEndRef.current) {
      // 新しい返信が追加された場合
      if (lastAddedMessageId && replies.some(reply => reply.id === lastAddedMessageId)) {
        repliesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        setHighlightedMessageId(lastAddedMessageId);
        
        // ハイライト効果を3秒後に消す
        const timer = setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
      // コンポーネントマウント時（スレッド表示時）
      else if (replies.length > 0) {
        repliesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, [lastAddedMessageId, replies]);

  if (!parentMessage) {
    return null;
  }

  return (
    <div className="flex flex-col h-full border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* 親メッセージ */}
      <div className="border-b border-gray-200 dark:border-gray-700">
            <MessageItem
              id={parentMessage.id}
              content={parentMessage.content}
              createdAt={parentMessage.createdAt}
              tags={parentMessage.tags}
              isArchived={parentMessage.isArchived}
              isTask={parentMessage.isTask}
              isCompleted={parentMessage.isCompleted}
              hasThread={false}
              onReply={() => {}}
              onTagClick={onTagClick}
              onArchiveToggle={onArchiveToggle}
              onTaskToggle={onTaskToggle}
              onTaskStatusToggle={onTaskStatusToggle}
              onEdit={editMessage}
            />
      </div>

      {/* 返信リスト */}
      <div className="flex-1 overflow-y-auto pb-4">
        {replies.length > 0 ? (
          [...replies].reverse().map(reply => (
            <div 
              key={reply.id}
              className={`transition-colors duration-1000 ${highlightedMessageId === reply.id ? 'bg-primary/10' : ''}`}
            >
              <MessageItem
                id={reply.id}
                content={reply.content}
                createdAt={reply.createdAt}
                tags={reply.tags}
                isArchived={reply.isArchived}
                isTask={reply.isTask}
                isCompleted={reply.isCompleted}
                hasThread={false}
                onReply={() => {}}
                onTagClick={onTagClick}
                onArchiveToggle={onArchiveToggle}
                onTaskToggle={onTaskToggle}
                onTaskStatusToggle={onTaskStatusToggle}
                onEdit={editMessage}
              />
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            このスレッドにはまだ返信がありません
          </div>
        )}
        <div ref={repliesEndRef} />
      </div>
    </div>
  );
};

export default ThreadView;
