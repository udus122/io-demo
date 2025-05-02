import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types';

interface MessageContextType {
  messages: Message[];
  lastAddedMessageId: string | null;
  addMessage: (content: string, parentId?: string | null) => void;
  addTagToMessage: (messageId: string, tag: string) => void;
  toggleArchive: (messageId: string) => void;
  toggleTaskCompletion: (messageId: string) => void;
  getAllTags: () => string[];
  getThreadReplies: (parentId: string) => Message[];
  getMessageById: (id: string) => Message | undefined;
  filterMessages: (filter: string, selectedTag?: string) => Message[];
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastAddedMessageId, setLastAddedMessageId] = useState<string | null>(null);

  // LocalStorageからメッセージを読み込む
  useEffect(() => {
    const storedMessages = localStorage.getItem('io-messages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        // 日付文字列をDateオブジェクトに変換
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to parse stored messages:', error);
      }
    }
  }, []);

  // メッセージが変更されたらLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('io-messages', JSON.stringify(messages));
  }, [messages]);

  // 新しいメッセージを追加
  const addMessage = (content: string, parentId: string | null = null) => {
    // コンテンツからタグを抽出（日本語対応）
    const tagRegex = /#([^\s#]+)/g;
    const tags: string[] = [];
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    // メッセージが[]で始まる場合はタスクとして認識
    const isTask = content.trim().startsWith('[]');
    // タスクの場合は[]を除去したコンテンツを使用
    const cleanContent = isTask ? content.replace(/^\[\]/, '').trim() : content;

    const newMessageId = uuidv4();
    const newMessage: Message = {
      id: newMessageId,
      content: cleanContent,
      createdAt: new Date(),
      tags,
      isArchived: false,
      parentId,
      isTask,
      isCompleted: false
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // 常に最後に追加されたメッセージIDを更新（親メッセージでもスレッド返信でも）
    setLastAddedMessageId(newMessageId);
  };

  // メッセージにタグを追加
  const addTagToMessage = (messageId: string, tag: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId && !msg.tags.includes(tag)
          ? { ...msg, tags: [...msg.tags, tag] }
          : msg
      )
    );
  };

  // メッセージのアーカイブ状態を切り替え
  const toggleArchive = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId
          ? { ...msg, isArchived: !msg.isArchived }
          : msg
      )
    );
  };

  // タスクの完了状態を切り替え
  const toggleTaskCompletion = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId && msg.isTask
          ? { ...msg, isCompleted: !msg.isCompleted }
          : msg
      )
    );
  };

  // すべてのタグを取得
  const getAllTags = () => {
    const allTags = new Set<string>();
    messages.forEach(msg => {
      msg.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  // 特定のスレッドの返信を取得
  const getThreadReplies = (parentId: string) => {
    return messages.filter(msg => msg.parentId === parentId);
  };

  // IDでメッセージを取得
  const getMessageById = (id: string) => {
    return messages.find(msg => msg.id === id);
  };

  // メッセージをフィルタリング
  const filterMessages = (filter: string, selectedTag?: string) => {
    let filteredMessages = messages;

    // アーカイブ状態でフィルタリング
    if (filter === 'archived') {
      filteredMessages = filteredMessages.filter(msg => msg.isArchived);
    } else if (filter === 'unarchived') {
      filteredMessages = filteredMessages.filter(msg => !msg.isArchived);
    } else if (filter === 'tasks') {
      // タスクのみをフィルタリング
      filteredMessages = filteredMessages.filter(msg => msg.isTask);
    }

    // タグでフィルタリング
    if (selectedTag) {
      filteredMessages = filteredMessages.filter(msg => msg.tags.includes(selectedTag));
    }

    return filteredMessages;
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        lastAddedMessageId,
        addMessage,
        addTagToMessage,
        toggleArchive,
        toggleTaskCompletion,
        getAllTags,
        getThreadReplies,
        getMessageById,
        filterMessages,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
