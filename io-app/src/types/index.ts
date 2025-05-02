export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  tags: string[];
  isArchived: boolean;
  parentId: string | null;
}

export interface MessageWithThreadInfo extends Message {
  hasReplies: boolean;
}
