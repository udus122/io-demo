import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Message, MessageWithThreadInfo } from '@/types';
import { useMessages } from './MessageContext';
import { searchMessages, SearchOptions } from '../utils/search';

interface SearchContextType {
  searchTerm: string;
  searchResults: MessageWithThreadInfo[];
  searchOptions: SearchOptions;
  isSearchActive: boolean;
  setSearchTerm: (term: string) => void;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  performSearch: () => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { messages } = useMessages();
  
  // デフォルト値で初期化（サーバーサイドレンダリング時にも同じ値を使用）
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MessageWithThreadInfo[]>([]);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchOptions, setSearchOptionsState] = useState<SearchOptions>({
    inContent: true,
    inTags: true,
    caseSensitive: false,
    dateFrom: null,
    dateTo: null,
    tags: [],
  });
  
  // クライアントサイドでのみローカルストレージから状態を読み込む
  useEffect(() => {
    // ローカルストレージから状態を読み込むヘルパー関数
    const getStoredState = <T,>(key: string, defaultValue: T): T => {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        try {
          return JSON.parse(storedValue);
        } catch (error) {
          console.error(`Failed to parse stored value for ${key}:`, error);
          return defaultValue;
        }
      }
      return defaultValue;
    };
    
    // ローカルストレージから各状態を読み込む
    setSearchTerm(getStoredState('io-searchTerm', ''));
    setIsSearchActive(getStoredState('io-isSearchActive', false));
    setSearchOptionsState(getStoredState('io-searchOptions', {
      inContent: true,
      inTags: true,
      caseSensitive: false,
      dateFrom: null,
      dateTo: null,
      tags: [],
    }));
  }, []);
  
  // 状態が変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('io-searchTerm', JSON.stringify(searchTerm));
  }, [searchTerm]);
  
  useEffect(() => {
    localStorage.setItem('io-isSearchActive', JSON.stringify(isSearchActive));
  }, [isSearchActive]);
  
  useEffect(() => {
    localStorage.setItem('io-searchOptions', JSON.stringify(searchOptions));
  }, [searchOptions]);

  const setSearchOptions = useCallback((options: Partial<SearchOptions>) => {
    setSearchOptionsState((prev: SearchOptions) => ({ ...prev, ...options }));
  }, []);

  const performSearch = useCallback(() => {
    if (!searchTerm.trim() && searchOptions.tags.length === 0 && !searchOptions.dateFrom && !searchOptions.dateTo) {
      setSearchResults([]);
      setIsSearchActive(false);
      return;
    }

    const results = searchMessages(messages, searchTerm, searchOptions);
    
    // 検索結果のメッセージにhasRepliesプロパティを追加
    const resultsWithThreadInfo = results.map((message: Message) => ({
      ...message,
      hasReplies: messages.some(m => m.parentId === message.id)
    }));
    
    setSearchResults(resultsWithThreadInfo);
    setIsSearchActive(true);
  }, [messages, searchTerm, searchOptions]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchActive(false);
    setSearchOptionsState({
      inContent: true,
      inTags: true,
      caseSensitive: false,
      dateFrom: null,
      dateTo: null,
      tags: [],
    });
    
    // ローカルストレージからも削除
    if (typeof window !== 'undefined') {
      localStorage.removeItem('io-searchTerm');
      localStorage.removeItem('io-isSearchActive');
      localStorage.removeItem('io-searchOptions');
    }
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        searchResults,
        searchOptions,
        isSearchActive,
        setSearchTerm,
        setSearchOptions,
        performSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
