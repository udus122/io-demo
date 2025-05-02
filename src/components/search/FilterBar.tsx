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
      {/* アーカイブフィルター - ON/OFFボタン */}
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => handleArchiveFilterChange(archiveFilter === 'all' ? 'unarchived' : 'all')}
          className={`px-2 py-1 text-xs rounded-md flex items-center ${
            archiveFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label={archiveFilter === 'all' ? "アーカイブ済みを非表示" : "アーカイブ済みを表示"}
        >
          {archiveFilter === 'all' ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
              <span className="ml-1 hidden sm:inline">アーカイブ済みを非表示</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="ml-1 hidden sm:inline">アーカイブ済みを表示</span>
            </>
          )}
        </button>
      </div>

      {/* 区切り線 */}
      <div className="h-6 border-r border-gray-300 dark:border-gray-600 mx-1"></div>

      {/* タスクフィルター */}
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => handleTaskFilterChange('all')}
          className={`px-2 py-1 text-xs rounded-md flex items-center ${
            taskFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="すべてのメッセージを表示"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="ml-1 hidden sm:inline">すべて</span>
        </button>
        <button 
          onClick={() => handleTaskFilterChange('tasks')}
          className={`px-2 py-1 text-xs rounded-md flex items-center ${
            taskFilter === 'tasks' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="タスクのみ表示"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="ml-1 hidden sm:inline">タスクのみ</span>
        </button>
        <button 
          onClick={() => handleTaskFilterChange('uncompleted-tasks')}
          className={`px-2 py-1 text-xs rounded-md flex items-center ${
            taskFilter === 'uncompleted-tasks' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="未完了タスクのみを表示"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          </svg>
          <span className="ml-1 hidden sm:inline">未完了タスクのみを表示</span>
        </button>
        <button 
          onClick={() => handleTaskFilterChange('completed-tasks')}
          className={`px-2 py-1 text-xs rounded-md flex items-center ${
            taskFilter === 'completed-tasks' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="完了済タスクのみを表示"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="ml-1 hidden sm:inline">完了済タスクのみを表示</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
