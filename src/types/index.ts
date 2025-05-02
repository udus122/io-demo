export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  tags: string[];
  isArchived: boolean;
  parentId: string | null;
  isTask: boolean;
  isCompleted: boolean;
}

export interface MessageWithThreadInfo extends Message {
  hasReplies: boolean;
  replyCount?: number;
}
