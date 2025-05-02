import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebar }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { channels, activeChannelId, isSidebarVisible, toggleSidebar } = useUI();
  
  // アクティブなチャンネル名を取得
  const activeChannel = channels.find(channel => channel.id === activeChannelId);
  const activeChannelName = activeChannel?.name || 'All';
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* サイドバー - モバイルではオフキャンバス、デスクトップでは表示/非表示を切り替え可能 */}
      <div className={`
        fixed md:static md:flex flex-col
        ${isSidebarVisible ? 'w-64' : 'w-16'} h-screen z-30
        transform transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarVisible ? 'md:translate-x-0' : 'md:translate-x-0'}
        border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
      `}>
        {/* サイドバーヘッダー */}
        <div className={`
          flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700
          ${isSidebarVisible ? '' : 'justify-center'}
        `}>
          <h1 className={`text-xl font-bold ${isSidebarVisible ? '' : 'mx-auto'}`}>IO</h1>
          {isSidebarVisible && (
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="サイドバーを最小化"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
          {!isSidebarVisible && (
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors absolute top-16 left-4"
              aria-label="サイドバーを展開"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
            aria-label="サイドバーを閉じる"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* サイドバーコンテンツ */}
        <div className={`flex-1 overflow-y-auto ${isSidebarVisible ? '' : 'md:hidden'}`}>
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
      
      {/* メインコンテンツエリア - サイドバーの表示/非表示に応じて幅を調整 */}
      <div className={`
        flex flex-col flex-1 overflow-hidden
        transition-all duration-300 ease-in-out
        ${isSidebarVisible ? 'md:w-[calc(100%-16rem)]' : 'md:w-[calc(100%-4rem)]'}
      `}>
        {/* ヘッダー - モバイル用のメニューボタンを含む */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="mr-4 md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="メニューを開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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
