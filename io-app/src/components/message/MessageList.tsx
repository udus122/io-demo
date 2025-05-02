import React from 'react';
import MessageItem from './MessageItem';
import { MessageWithThreadInfo } from '@/types';

interface MessageListProps {
  messages: MessageWithThreadInfo[];
  onReply: (id: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onReply,
  onTagClick,
  onArchiveToggle,
}) => {
  // 親メッセージ（スレッドの開始メッセージ）のみをフィルタリング
  const rootMessages = messages.filter(message => message.parentId === null);

  return (
    <div className="flex-1 overflow-y-auto">
      {rootMessages.length > 0 ? (
        rootMessages.map(message => (
          <MessageItem
            key={message.id}
            id={message.id}
            content={message.content}
            createdAt={message.createdAt}
            tags={message.tags}
            isArchived={message.isArchived}
            hasThread={message.hasReplies}
            onReply={onReply}
            onTagClick={onTagClick}
            onArchiveToggle={onArchiveToggle}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="text-lg">メッセージはまだありません</p>
          <p className="text-sm mt-2">下部の入力欄からメッセージを送信してください</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
