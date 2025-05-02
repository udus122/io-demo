import React, { createContext, useContext, useState, useCallback } from 'react';
import { Message } from '@/types';
import { useMessages } from './MessageContext';
import { searchMessages, SearchOptions } from '../utils/search';

interface SearchContextType {
  searchTerm: string;
  searchResults: Message[];
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchOptions, setSearchOptionsState] = useState<SearchOptions>({
    inContent: true,
    inTags: true,
    caseSensitive: false,
    dateFrom: null,
    dateTo: null,
    tags: [],
  });

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
