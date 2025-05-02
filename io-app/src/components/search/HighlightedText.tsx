import React from 'react';
import { findSearchTermPositions } from '@/utils/search';

interface HighlightedTextProps {
  text: string;
  searchTerm: string;
  caseSensitive?: boolean;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  searchTerm,
  caseSensitive = false,
}) => {
  if (!searchTerm.trim()) {
    return <>{text}</>;
  }

  const positions = findSearchTermPositions(text, searchTerm, caseSensitive);
  
  if (positions.length === 0) {
    return <>{text}</>;
  }

  // テキストを分割してハイライト部分と非ハイライト部分に分ける
  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  positions.forEach((position, index) => {
    // ハイライト前のテキスト
    if (position.start > lastIndex) {
      result.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, position.start)}
        </span>
      );
    }

    // ハイライト部分
    result.push(
      <mark
        key={`highlight-${index}`}
        className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5"
      >
        {text.substring(position.start, position.end)}
      </mark>
    );

    lastIndex = position.end;
  });

  // 最後の部分
  if (lastIndex < text.length) {
    result.push(
      <span key={`text-last`}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <>{result}</>;
};

export default HighlightedText;
