import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  onAddTag: (tag: string) => void;
  existingTags: string[];
}

const TagInput: React.FC<TagInputProps> = ({ onAddTag, existingTags }) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !existingTags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      setTagInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="新しいタグを追加..."
        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        onClick={handleAddTag}
        disabled={!tagInput.trim()}
        className="px-3 py-1 bg-primary text-white rounded-md disabled:opacity-50"
      >
        追加
      </button>
    </div>
  );
};

export default TagInput;
