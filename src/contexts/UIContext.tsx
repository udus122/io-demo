import React, { createContext, useContext, useState, useEffect } from 'react';
import { Channel } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface UIContextType {
  activeFilter: string;
  selectedTag: string | null;
  activeThreadId: string | null;
  channels: Channel[];
  activeChannelId: string;
  setActiveFilter: (filter: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setActiveThreadId: (threadId: string | null) => void;
  addChannel: (name: string) => void;
  setActiveChannelId: (channelId: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: React.ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState<string>('unarchived');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');

  // LocalStorageからチャンネルを読み込む
  useEffect(() => {
    const storedChannels = localStorage.getItem('io-channels');
    if (storedChannels) {
      try {
        const parsedChannels = JSON.parse(storedChannels);
        // 日付文字列をDateオブジェクトに変換
        const channelsWithDates = parsedChannels.map((channel: any) => ({
          ...channel,
          createdAt: new Date(channel.createdAt)
        }));
        setChannels(channelsWithDates);
        
        // アクティブなチャンネルがない場合は最初のチャンネルを選択
        if (channelsWithDates.length > 0 && !activeChannelId) {
          setActiveChannelId(channelsWithDates[0].id);
        }
      } catch (error) {
        console.error('Failed to parse stored channels:', error);
      }
    } else {
      // チャンネルがない場合は「一般」チャンネルを作成
      const generalChannel: Channel = {
        id: uuidv4(),
        name: '一般',
        createdAt: new Date()
      };
      setChannels([generalChannel]);
      setActiveChannelId(generalChannel.id);
    }
  }, []);

  // チャンネルが変更されたらLocalStorageに保存
  useEffect(() => {
    if (channels.length > 0) {
      localStorage.setItem('io-channels', JSON.stringify(channels));
    }
  }, [channels]);

  // 新しいチャンネルを追加
  const addChannel = (name: string) => {
    const newChannel: Channel = {
      id: uuidv4(),
      name,
      createdAt: new Date()
    };
    setChannels(prevChannels => [...prevChannels, newChannel]);
    return newChannel.id;
  };

  return (
    <UIContext.Provider
      value={{
        activeFilter,
        selectedTag,
        activeThreadId,
        channels,
        activeChannelId,
        setActiveFilter,
        setSelectedTag,
        setActiveThreadId,
        addChannel,
        setActiveChannelId,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
