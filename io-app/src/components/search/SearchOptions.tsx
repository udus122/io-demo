import React, { useState } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { useMessages } from '@/contexts/MessageContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface SearchOptionsProps {
  isVisible: boolean;
}

const SearchOptions: React.FC<SearchOptionsProps> = ({ isVisible }) => {
  const { searchOptions, setSearchOptions, performSearch } = useSearch();
  const { getAllTags } = useMessages();
  const allTags = getAllTags();
  
  // 日付文字列を管理するためのローカル状態
  const [dateFromStr, setDateFromStr] = useState<string>(
    searchOptions.dateFrom ? format(searchOptions.dateFrom, 'yyyy-MM-dd') : ''
  );
  const [dateToStr, setDateToStr] = useState<string>(
    searchOptions.dateTo ? format(searchOptions.dateTo, 'yyyy-MM-dd') : ''
  );

  // 検索オプションの変更ハンドラ
  const handleOptionChange = (option: keyof typeof searchOptions, value: any) => {
    setSearchOptions({ [option]: value });
  };

  // 日付範囲の変更ハンドラ
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setDateFromStr(dateStr);
    
    if (dateStr) {
      const date = new Date(dateStr);
      setSearchOptions({ dateFrom: date });
    } else {
      setSearchOptions({ dateFrom: null });
    }
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setDateToStr(dateStr);
    
    if (dateStr) {
      const date = new Date(dateStr);
      setSearchOptions({ dateTo: date });
    } else {
      setSearchOptions({ dateTo: null });
    }
  };

  // タグの選択/解除ハンドラ
  const handleTagToggle = (tag: string) => {
    const currentTags = [...searchOptions.tags];
    const tagIndex = currentTags.indexOf(tag);
    
    if (tagIndex === -1) {
      // タグを追加
      setSearchOptions({ tags: [...currentTags, tag] });
    } else {
      // タグを削除
      currentTags.splice(tagIndex, 1);
      setSearchOptions({ tags: currentTags });
    }
  };

  // 検索オプション適用ハンドラ
  const handleApplyOptions = () => {
    performSearch();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <h3 className="font-medium mb-3">検索オプション</h3>
      
      <div className="space-y-4">
        {/* 検索対象オプション */}
        <div>
          <h4 className="text-sm font-medium mb-2">検索対象</h4>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchOptions.inContent}
                onChange={(e) => handleOptionChange('inContent', e.target.checked)}
                className="mr-2"
              />
              メッセージ内容
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchOptions.inTags}
                onChange={(e) => handleOptionChange('inTags', e.target.checked)}
                className="mr-2"
              />
              タグ
            </label>
          </div>
        </div>

        {/* 大文字小文字の区別 */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={searchOptions.caseSensitive}
              onChange={(e) => handleOptionChange('caseSensitive', e.target.checked)}
              className="mr-2"
            />
            大文字小文字を区別する
          </label>
        </div>

        {/* 日付範囲 */}
        <div>
          <h4 className="text-sm font-medium mb-2">日付範囲</h4>
          <div className="flex space-x-4">
            <div>
              <label className="block text-xs mb-1">開始日</label>
              <input
                type="date"
                value={dateFromStr}
                onChange={handleDateFromChange}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">終了日</label>
              <input
                type="date"
                value={dateToStr}
                onChange={handleDateToChange}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* タグ選択 */}
        <div>
          <h4 className="text-sm font-medium mb-2">タグで絞り込み</h4>
          <div className="flex flex-wrap gap-2">
            {allTags.length > 0 ? (
              allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 rounded-full text-xs ${
                    searchOptions.tags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  #{tag}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">タグはありません</p>
            )}
          </div>
        </div>

        {/* 適用ボタン */}
        <div className="flex justify-end">
          <button
            onClick={handleApplyOptions}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            検索条件を適用
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchOptions;
