import { Message } from '@/types';

export interface SearchOptions {
  inContent: boolean;
  inTags: boolean;
  caseSensitive: boolean;
  dateFrom: Date | null;
  dateTo: Date | null;
  tags: string[];
}

/**
 * メッセージを検索する関数
 * @param messages 検索対象のメッセージ配列
 * @param searchTerm 検索キーワード
 * @param options 検索オプション
 * @returns 検索条件に一致するメッセージの配列
 */
export function searchMessages(
  messages: Message[],
  searchTerm: string,
  options: SearchOptions
): Message[] {
  // 検索条件がない場合は空配列を返す
  if (!searchTerm.trim() && options.tags.length === 0 && !options.dateFrom && !options.dateTo) {
    return [];
  }

  return messages.filter(message => {
    // 日付範囲でフィルタリング
    if (options.dateFrom && message.createdAt < options.dateFrom) {
      return false;
    }
    if (options.dateTo) {
      const dateTo = new Date(options.dateTo);
      dateTo.setHours(23, 59, 59, 999); // 終了日の終わりまで
      if (message.createdAt > dateTo) {
        return false;
      }
    }

    // タグでフィルタリング
    if (options.tags.length > 0) {
      const hasMatchingTag = options.tags.some(tag => message.tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    // 検索キーワードが空の場合は、日付とタグのフィルタリングのみを適用
    if (!searchTerm.trim()) {
      return true;
    }

    // テキスト検索
    let contentMatch = false;
    let tagMatch = false;

    // コンテンツ内の検索
    if (options.inContent) {
      const content = options.caseSensitive ? message.content : message.content.toLowerCase();
      const term = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
      contentMatch = content.includes(term);
    }

    // タグ内の検索
    if (options.inTags) {
      const tags = message.tags.map(tag => options.caseSensitive ? tag : tag.toLowerCase());
      const term = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
      tagMatch = tags.some(tag => tag.includes(term));
    }

    return contentMatch || tagMatch;
  });
}

/**
 * テキスト内の検索キーワードの位置を特定する関数
 * @param text 検索対象のテキスト
 * @param searchTerm 検索キーワード
 * @param caseSensitive 大文字小文字を区別するかどうか
 * @returns 検索キーワードの開始位置と終了位置の配列
 */
export function findSearchTermPositions(
  text: string,
  searchTerm: string,
  caseSensitive: boolean = false
): Array<{ start: number; end: number }> {
  if (!searchTerm.trim()) {
    return [];
  }

  const positions: Array<{ start: number; end: number }> = [];
  const textToSearch = caseSensitive ? text : text.toLowerCase();
  const termToFind = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  
  let position = textToSearch.indexOf(termToFind);
  while (position !== -1) {
    positions.push({
      start: position,
      end: position + termToFind.length
    });
    position = textToSearch.indexOf(termToFind, position + 1);
  }

  return positions;
}
