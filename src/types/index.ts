export interface Channel {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  tags: string[];
  isArchived: boolean;
  parentId: string | null;
  isTask: boolean;
  isCompleted: boolean;
  channelId: string;
}

export interface MessageWithThreadInfo extends Message {
  hasReplies: boolean;
  replyCount?: number;
}
