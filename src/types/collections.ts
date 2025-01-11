export interface Collection {
  id: string;
  creativeId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdAt: string;
  modifiedAt: string;
  uploadCount: number;
}

export interface CollectionUpload {
  collectionId: string;
  uploadId: string;
  addedAt: string;
  position: number;
}
