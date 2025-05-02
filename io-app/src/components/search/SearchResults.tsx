import React from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { MessageWithThreadInfo } from '@/types';
import HighlightedText from './HighlightedText';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface SearchResultItemProps {
  message: MessageWithThreadInfo;
  searchTerm: string;
  caseSensitive: boolean;
  onReply: (id: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  message,
  searchTerm,
  caseSensitive,
  onReply,
  onTagClick,
  onArchiveToggle,
}) => {
  return (
    <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${message.isArchived ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}`}>
      {/* メッセージヘッダー */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {format(message.createdAt, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onReply(message.id)}
            className="text-xs text-gray-500 hover:text-primary"
          >
            返信
          </button>
          <button
            onClick={() => onArchiveToggle(message.id)}
            className="text-xs text-gray-500 hover:text-primary"
          >
            {message.isArchived ? 'アーカイブ解除' : 'アーカイブ'}
          </button>
        </div>
      </div>

      {/* メッセージ本文（ハイライト表示） */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <HighlightedText
          text={message.content}
          searchTerm={searchTerm}
          caseSensitive={caseSensitive}
        />
      </div>

      {/* タグとスレッド情報 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {message.tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs"
          >
            #{tag}
          </button>
        ))}
        
        {message.hasReplies && (
          <div className="ml-auto text-xs text-primary cursor-pointer" onClick={() => onReply(message.id)}>
            スレッドを表示
          </div>
        )}
      </div>
    </div>
  );
};

interface SearchResultsProps {
  onReply: (id: string) => void;
  onTagClick: (tag: string) => void;
  onArchiveToggle: (id: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  onReply,
  onTagClick,
  onArchiveToggle,
}) => {
  const { searchResults, searchTerm, isSearchActive, searchOptions } = useSearch();

  if (!isSearchActive) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 p-2 bg-gray-100 dark:bg-gray-700 z-10 flex justify-between items-center">
        <div>
          検索結果: <span className="font-medium">{searchResults.length}</span> 件
        </div>
        {searchOptions.tags.length > 0 && (
          <div className="text-sm">
            タグ: {searchOptions.tags.map((tag: string) => `#${tag}`).join(', ')}
          </div>
        )}
      </div>
      
      {searchResults.length > 0 ? (
        searchResults.map((message: MessageWithThreadInfo) => (
          <SearchResultItem
            key={message.id}
            message={message}
            searchTerm={searchTerm}
            caseSensitive={searchOptions.caseSensitive}
            onReply={onReply}
            onTagClick={onTagClick}
            onArchiveToggle={onArchiveToggle}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p className="text-lg">検索結果はありません</p>
          <p className="text-sm mt-2">検索条件を変更してみてください</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
