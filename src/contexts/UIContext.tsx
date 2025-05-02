import React, { createContext, useContext, useState, useEffect } from 'react';
import { Channel } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface UIContextType {
  archiveFilter: string;
  taskFilter: string;
  selectedTag: string | null;
  activeThreadId: string | null;
  channels: Channel[];
  activeChannelId: string;
  isSidebarVisible: boolean;
  setArchiveFilter: (filter: string) => void;
  setTaskFilter: (filter: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setActiveThreadId: (threadId: string | null) => void;
  addChannel: (name: string) => void;
  deleteChannel: (channelId: string) => boolean;
  setActiveChannelId: (channelId: string) => void;
  toggleSidebar: () => void;
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
  const [archiveFilter, setArchiveFilter] = useState<string>('unarchived'); // デフォルトはアーカイブ以外を表示
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);

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
      // チャンネルがない場合は「All」チャンネルを作成
      const allChannel: Channel = {
        id: 'all', // 特別なID「all」を使用
        name: 'All',
        createdAt: new Date()
      };
      setChannels([allChannel]);
      setActiveChannelId(allChannel.id);
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
    // 'all'は予約済みIDなので、別のIDを生成
    const newId = name.toLowerCase() === 'all' ? `channel-${uuidv4()}` : uuidv4();
    
    const newChannel: Channel = {
      id: newId,
      name,
      createdAt: new Date()
    };
    setChannels(prevChannels => [...prevChannels, newChannel]);
    return newChannel.id;
  };

  // チャンネルを削除
  const deleteChannel = (channelId: string): boolean => {
    // 「All」チャンネルは削除できない
    if (channelId === 'all') {
      return false;
    }

    // 削除対象のチャンネルがアクティブな場合は「All」チャンネルをアクティブにする
    if (channelId === activeChannelId) {
      setActiveChannelId('all');
    }

    // チャンネルを削除
    setChannels(prevChannels => prevChannels.filter(channel => channel.id !== channelId));
    return true;
  };

  // サイドバーの表示/非表示を切り替える
  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  return (
    <UIContext.Provider
      value={{
        archiveFilter,
        taskFilter,
        selectedTag,
        activeThreadId,
        channels,
        activeChannelId,
        isSidebarVisible,
        setArchiveFilter,
        setTaskFilter,
        setSelectedTag,
        setActiveThreadId,
        addChannel,
        deleteChannel,
        setActiveChannelId,
        toggleSidebar,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
