import React from 'react';
import { useUI } from '@/contexts/UIContext';

interface SidebarProps {
  tags: string[];
  onTagSelect: (tag: string) => void;
  onFilterChange: (filter: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tags, onTagSelect, onFilterChange }) => {
  const { activeFilter, selectedTag } = useUI();
  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">IO</h1>
      
      {/* フィルターコントロール */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-2 text-gray-500 dark:text-gray-400">フィルター</h2>
        <div className="space-y-2">
          <button 
            onClick={() => onFilterChange('all')}
            className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
              activeFilter === 'all' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
            }`}
          >
            すべて
          </button>
          <button 
            onClick={() => onFilterChange('unarchived')}
            className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
              activeFilter === 'unarchived' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
            }`}
          >
            アーカイブ以外
          </button>
          <button 
            onClick={() => onFilterChange('archived')}
            className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
              activeFilter === 'archived' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
            }`}
          >
            アーカイブのみ
          </button>
        </div>
      </div>
      
      {/* タグリスト */}
      <div>
        <h2 className="text-sm font-semibold mb-2 text-gray-500 dark:text-gray-400">タグ</h2>
        <div className="space-y-1">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagSelect(tag)}
                className={`w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
                  selectedTag === tag ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                }`}
              >
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                {tag}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 px-3">
              タグはまだありません
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
