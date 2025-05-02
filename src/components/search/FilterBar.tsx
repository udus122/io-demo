import React from 'react';
import { useUI } from '@/contexts/UIContext';

const FilterBar: React.FC = () => {
  const { archiveFilter, taskFilter, setArchiveFilter, setTaskFilter } = useUI();

  // アーカイブフィルター変更ハンドラ
  const handleArchiveFilterChange = (filter: string) => {
    setArchiveFilter(filter);
  };

  // タスクフィルター変更ハンドラ
  const handleTaskFilterChange = (filter: string) => {
    setTaskFilter(filter);
  };

  return (
    <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap gap-2">
      {/* アーカイブフィルター */}
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => handleArchiveFilterChange('all')}
          className={`px-2 py-1 text-xs rounded-md ${
            archiveFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          すべて
        </button>
        <button 
          onClick={() => handleArchiveFilterChange('unarchived')}
          className={`px-2 py-1 text-xs rounded-md ${
            archiveFilter === 'unarchived' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          アーカイブ以外
        </button>
        <button 
          onClick={() => handleArchiveFilterChange('archived')}
          className={`px-2 py-1 text-xs rounded-md ${
            archiveFilter === 'archived' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          アーカイブのみ
        </button>
      </div>

      {/* 区切り線 */}
      <div className="h-6 border-r border-gray-300 dark:border-gray-600 mx-1"></div>

      {/* タスクフィルター */}
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => handleTaskFilterChange('all')}
          className={`px-2 py-1 text-xs rounded-md ${
            taskFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          すべて
        </button>
        <button 
          onClick={() => handleTaskFilterChange('tasks')}
          className={`px-2 py-1 text-xs rounded-md ${
            taskFilter === 'tasks' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          タスクのみ
        </button>
        <button 
          onClick={() => handleTaskFilterChange('completed-tasks')}
          className={`px-2 py-1 text-xs rounded-md ${
            taskFilter === 'completed-tasks' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          完了タスク
        </button>
        <button 
          onClick={() => handleTaskFilterChange('uncompleted-tasks')}
          className={`px-2 py-1 text-xs rounded-md ${
            taskFilter === 'uncompleted-tasks' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          未完了タスク
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
