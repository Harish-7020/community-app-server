export type SearchResult =
  | { type: 'user'; id: number; name: string; avatar?: string; createdAt?: Date }
  | { type: 'community'; id: number; name: string; avatar?: string; createdAt?: Date }
  | { type: 'post'; id: number; title?: string; content?: string; createdAt?: Date };
