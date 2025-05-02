import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebar }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { channels, activeChannelId } = useUI();
  
  // アクティブなチャンネル名を取得
  const activeChannel = channels.find(channel => channel.id === activeChannelId);
  const activeChannelName = activeChannel?.name || 'Inbox';
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* サイドバー - モバイルではオフキャンバス、デスクトップでは常に表示 */}
      <div className={`
        fixed md:static md:flex
        w-64 h-full z-30
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
      `}>
        {/* サイドバーヘッダー - モバイルでのみ表示 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <h1 className="text-xl font-bold">IO</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500"
            aria-label="サイドバーを閉じる"
          >
            ✕
          </button>
        </div>
        
        {/* サイドバーコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {sidebar}
        </div>
      </div>
      
      {/* オーバーレイ - モバイルでサイドバー表示時のみ表示 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* メインコンテンツエリア */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ヘッダー - モバイル用のメニューボタンを含む */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="mr-4 md:hidden"
            aria-label="メニューを開く"
          >
            ≡
          </button>
          <h1 className="text-xl font-bold md:hidden">IO</h1>
          <div className="ml-4 text-lg font-medium"># {activeChannelName}</div>
        </div>
        
        {/* コンテンツ */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
