export interface Topic {
  tId: string;
  name: string,
  keywords?: string[],
  description?: string,
  embeddingId?: string,
  parentId?: string,
  children?: Topic[],
  showChildren?: boolean,
  createdAt?: Date,
  updatedAt?: Date
}

export interface TopicTree {
  topics: Topic[];
}

export interface UserSpecifiedTopic extends Topic {
  weight?: number,
}