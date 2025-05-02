import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import { MessageWithThreadInfo } from '@/types';

interface MessageListProps {
  messages: MessageWithThreadInfo[];
  onReply: (id: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
  lastAddedMessageId?: string | null;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onReply,
  onTagClick,
  onArchiveToggle,
  lastAddedMessageId,
}) => {
  // 親メッセージ（スレッドの開始メッセージ）のみをフィルタリング
  const rootMessages = messages.filter(message => message.parentId === null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // 新しいメッセージが追加されたときにスクロールする
  useEffect(() => {
    if (lastAddedMessageId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setHighlightedMessageId(lastAddedMessageId);
      
      // ハイライト効果を3秒後に消す
      const timer = setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [lastAddedMessageId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {rootMessages.length > 0 ? (
        rootMessages.map(message => (
          <div 
            key={message.id}
            className={`transition-colors duration-1000 ${highlightedMessageId === message.id ? 'bg-primary/10' : ''}`}
          >
            <MessageItem
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
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="text-lg">メッセージはまだありません</p>
          <p className="text-sm mt-2">下部の入力欄からメッセージを送信してください</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
