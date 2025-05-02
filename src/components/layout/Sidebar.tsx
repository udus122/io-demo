import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';

interface SidebarProps {
  tags: string[];
  onTagSelect: (tag: string) => void;
  onArchiveFilterChange: (filter: string) => void;
  onTaskFilterChange: (filter: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tags, onTagSelect, onArchiveFilterChange, onTaskFilterChange }) => {
  const { archiveFilter, taskFilter, selectedTag, channels, activeChannelId, setActiveChannelId, addChannel, deleteChannel } = useUI();
  const [newChannelName, setNewChannelName] = useState('');
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  // チャンネル選択
  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
  };

  // 新しいチャンネルを追加
  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      addChannel(newChannelName.trim());
      setNewChannelName('');
      setIsAddingChannel(false);
    }
  };

  // チャンネルを削除
  const handleDeleteChannel = (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // チャンネル選択イベントが発火しないようにする
    deleteChannel(channelId);
  };

  // Enterキーで新しいチャンネルを追加
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddChannel();
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* チャンネルリスト */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">チャンネル</h2>
          <button 
            onClick={() => setIsAddingChannel(true)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="チャンネルを追加"
          >
            +
          </button>
        </div>
        
        {/* チャンネル追加フォーム */}
        {isAddingChannel && (
          <div className="mb-2 flex">
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="チャンネル名"
              className="flex-1 px-2 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={handleAddChannel}
              className="px-2 py-1 bg-primary text-white rounded-r-md text-sm"
            >
              追加
            </button>
          </div>
        )}
        
        {/* チャンネル一覧 */}
        <div className="space-y-1 mb-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center group"
            >
              <button
                onClick={() => handleChannelSelect(channel.id)}
                className={`flex-1 text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
                  activeChannelId === channel.id ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                }`}
              >
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                {channel.name}
              </button>
              {/* 「All」チャンネル以外は削除ボタンを表示 */}
              {channel.id !== 'all' && (
                <button
                  onClick={(e) => handleDeleteChannel(channel.id, e)}
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`${channel.name}チャンネルを削除`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
