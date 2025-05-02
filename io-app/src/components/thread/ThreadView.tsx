import React from 'react';
import MessageItem from '../message/MessageItem';
import MessageInput from '../message/MessageInput';
import { Message } from '@/types';

interface ThreadViewProps {
  parentMessage: Message | null;
  replies: Message[];
  onSendReply: (content: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
  onClose: () => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({
  parentMessage,
  replies,
  onSendReply,
  onTagClick,
  onArchiveToggle,
  onClose,
}) => {
  if (!parentMessage) {
    return null;
  }

  return (
    <div className="flex flex-col h-full border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold">スレッド</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* 親メッセージ */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <MessageItem
          id={parentMessage.id}
          content={parentMessage.content}
          createdAt={parentMessage.createdAt}
          tags={parentMessage.tags}
          isArchived={parentMessage.isArchived}
          hasThread={false}
          onReply={() => {}}
          onTagClick={onTagClick}
          onArchiveToggle={onArchiveToggle}
        />
      </div>

      {/* 返信リスト */}
      <div className="flex-1 overflow-y-auto">
        {replies.length > 0 ? (
          replies.map(reply => (
            <MessageItem
              key={reply.id}
              id={reply.id}
              content={reply.content}
              createdAt={reply.createdAt}
              tags={reply.tags}
              isArchived={reply.isArchived}
              hasThread={false}
              onReply={() => {}}
              onTagClick={onTagClick}
              onArchiveToggle={onArchiveToggle}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            このスレッドにはまだ返信がありません
          </div>
        )}
      </div>

      {/* 返信入力 */}
      <MessageInput
        onSendMessage={onSendReply}
        replyToId={parentMessage.id}
        placeholder="返信を入力..."
      />
    </div>
  );
};

export default ThreadView;
