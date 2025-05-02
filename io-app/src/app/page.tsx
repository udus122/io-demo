'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Sidebar from '@/components/layout/Sidebar';
import MessageList from '@/components/message/MessageList';
import MessageInput from '@/components/message/MessageInput';
import ThreadView from '@/components/thread/ThreadView';
import SearchBar from '@/components/search/SearchBar';
import SearchOptions from '@/components/search/SearchOptions';
import SearchResults from '@/components/search/SearchResults';
import { MessageProvider, useMessages } from '@/contexts/MessageContext';
import { UIProvider, useUI } from '@/contexts/UIContext';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';

const MainContent = () => {
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const { isSearchActive } = useSearch();
  const { 
    messages, 
    lastAddedMessageId,
    addMessage, 
    toggleArchive, 
    toggleTaskCompletion,
    getAllTags, 
    getThreadReplies, 
    getMessageById, 
    filterMessages 
  } = useMessages();
  
  const { 
    activeFilter, 
    selectedTag, 
    activeThreadId, 
    setActiveFilter, 
    setSelectedTag, 
    setActiveThreadId 
  } = useUI();

  // メッセージの送信
  const handleSendMessage = (content: string) => {
    addMessage(content);
  };

  // スレッドへの返信
  const handleSendReply = (content: string) => {
    if (activeThreadId) {
      addMessage(content, activeThreadId);
    }
  };

  // スレッドを開く
  const handleOpenThread = (messageId: string) => {
    setActiveThreadId(messageId);
  };

  // スレッドを閉じる
  const handleCloseThread = () => {
    setActiveThreadId(null);
  };

  // タグをクリック
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  // フィルター変更
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setSelectedTag(null);
  };

  // タスク完了状態の切り替え
  const handleTaskToggle = (messageId: string) => {
    toggleTaskCompletion(messageId);
  };

  // フィルタリングされたメッセージ
  const filteredMessages = filterMessages(activeFilter, selectedTag || undefined);

  // アクティブなスレッドの親メッセージと返信
  const activeThreadParent = activeThreadId ? getMessageById(activeThreadId) || null : null;
  const activeThreadReplies = activeThreadId ? getThreadReplies(activeThreadId) : [];

  // メッセージにスレッドがあるかどうかを判定
  const messagesWithThreadInfo = filteredMessages.map(msg => ({
    ...msg,
    hasReplies: messages.some(m => m.parentId === msg.id)
  }));

  // 検索オプションの表示/非表示を切り替える
  const toggleSearchOptions = () => {
    setShowSearchOptions(prev => !prev);
  };

  return (
    <MainLayout
      sidebar={
        <Sidebar
          tags={getAllTags()}
          onTagSelect={handleTagClick}
          onFilterChange={handleFilterChange}
        />
      }
    >
      <div className="flex flex-col h-full">
        {/* 検索バー */}
        <SearchBar onToggleOptions={toggleSearchOptions} />
        
        {/* 検索オプション */}
        <SearchOptions isVisible={showSearchOptions} />
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* 検索結果またはメッセージリスト */}
          {isSearchActive ? (
            <SearchResults
              onReply={handleOpenThread}
              onTagClick={handleTagClick}
              onArchiveToggle={toggleArchive}
              onTaskToggle={handleTaskToggle}
            />
          ) : (
            <>
              {/* メッセージリストとメッセージ入力欄のコンテナ */}
              <div className={`
                flex flex-col
                ${activeThreadId ? 'w-full md:w-1/2' : 'w-full'}
                transition-all duration-300
              `}>
                {/* メッセージリスト - モバイルではスレッド表示時に非表示 */}
                <div className={`
                  flex-1 overflow-auto
                  ${activeThreadId ? 'hidden md:block' : ''}
                `}>
                  <MessageList
                    messages={messagesWithThreadInfo}
                    onReply={handleOpenThread}
                    onTagClick={handleTagClick}
                    onArchiveToggle={toggleArchive}
                    onTaskToggle={handleTaskToggle}
                    lastAddedMessageId={lastAddedMessageId}
                  />
                </div>

                {/* メッセージ入力欄 - スレッド非表示時または常にデスクトップで表示、モバイルではsticky */}
                <div className={`${activeThreadId ? 'hidden md:block' : ''} sticky bottom-0 z-10`}>
                  <MessageInput onSendMessage={handleSendMessage} />
                </div>
              </div>

              {/* スレッドエリアとスレッド用入力欄のコンテナ */}
              {activeThreadId && (
                <div className="w-full md:w-1/2 flex flex-col">
                  <div className="flex-1 overflow-auto">
                    <ThreadView
                      parentMessage={activeThreadParent}
                      replies={activeThreadReplies}
                      onSendReply={handleSendReply}
                      onTagClick={handleTagClick}
                      onArchiveToggle={toggleArchive}
                      onTaskToggle={handleTaskToggle}
                      onClose={handleCloseThread}
                    />
                  </div>
                  
                  {/* スレッド用メッセージ入力欄 - モバイルとデスクトップの両方で表示、モバイルではsticky */}
                  <div className="md:block sticky bottom-0 z-10">
                    <MessageInput 
                      onSendMessage={handleSendReply} 
                      replyToId={activeThreadId}
                      placeholder="返信を入力..."
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default function Home() {
  return (
    <MessageProvider>
      <UIProvider>
        <SearchProvider>
          <MainContent />
        </SearchProvider>
      </UIProvider>
    </MessageProvider>
  );
}
