import { useState, useCallback, useEffect } from "react";
import { CollectionService } from "../services/collection.service";
import { Collection } from "../types/collections";
import { Upload } from "../types/uploads";
import { useAuth } from "../contexts/AuthContext";

export const useCollections = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [collectionUploads, setCollectionUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCollections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const userCollections = await CollectionService.getCreativeCollections(
        user.id
      );
      setCollections(userCollections);
    } catch (err) {
      setError("Failed to fetch collections");
      console.error("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCollection = useCallback(
    async (name: string, description?: string) => {
      if (!user) return;
      setError(null);
      try {
        const newCollection = await CollectionService.createCollection(
          user.id,
          name,
          description
        );
        setCollections((prev) => [...prev, newCollection]);
        return newCollection;
      } catch (err) {
        setError("Failed to create collection");
        console.error("Error creating collection:", err);
      }
    },
    [user]
  );

  const updateCollection = useCallback(
    async (collectionId: string, updates: Partial<Collection>) => {
      setError(null);
      try {
        await CollectionService.updateCollection(collectionId, updates);
        setCollections((prev) =>
          prev.map((col) =>
            col.id === collectionId
              ? { ...col, ...updates, modifiedAt: new Date().toISOString() }
              : col
          )
        );
      } catch (err) {
        setError("Failed to update collection");
        console.error("Error updating collection:", err);
      }
    },
    []
  );

  const deleteCollection = useCallback(
    async (collectionId: string) => {
      setError(null);
      try {
        await CollectionService.deleteCollection(collectionId);
        setCollections((prev) => prev.filter((col) => col.id !== collectionId));
        if (selectedCollection?.id === collectionId) {
          setSelectedCollection(null);
          setCollectionUploads([]);
        }
      } catch (err) {
        setError("Failed to delete collection");
        console.error("Error deleting collection:", err);
      }
    },
    [selectedCollection]
  );

  const addUploadToCollection = useCallback(
    async (collectionId: string, uploadId: string) => {
      setError(null);
      try {
        await CollectionService.addUploadToCollection(collectionId, uploadId);
        // Refresh collection uploads if this is the selected collection
        if (selectedCollection?.id === collectionId) {
          const uploads = await CollectionService.getCollectionUploads(
            collectionId
          );
          setCollectionUploads(uploads);
        }
        // Update collection count in the list
        setCollections((prev) =>
          prev.map((col) =>
            col.id === collectionId
              ? {
                  ...col,
                  uploadCount: col.uploadCount + 1,
                  modifiedAt: new Date().toISOString(),
                }
              : col
          )
        );
      } catch (err) {
        setError("Failed to add upload to collection");
        console.error("Error adding upload to collection:", err);
      }
    },
    [selectedCollection]
  );

  const removeUploadFromCollection = useCallback(
    async (collectionId: string, uploadId: string) => {
      setError(null);
      try {
        await CollectionService.removeUploadFromCollection(
          collectionId,
          uploadId
        );
        // Refresh collection uploads if this is the selected collection
        if (selectedCollection?.id === collectionId) {
          const uploads = await CollectionService.getCollectionUploads(
            collectionId
          );
          setCollectionUploads(uploads);
        }
        // Update collection count in the list
        setCollections((prev) =>
          prev.map((col) =>
            col.id === collectionId
              ? {
                  ...col,
                  uploadCount: Math.max(0, col.uploadCount - 1),
                  modifiedAt: new Date().toISOString(),
                }
              : col
          )
        );
      } catch (err) {
        setError("Failed to remove upload from collection");
        console.error("Error removing upload from collection:", err);
      }
    },
    [selectedCollection]
  );

  const selectCollection = useCallback(
    async (collection: Collection | null) => {
      setSelectedCollection(collection);
      if (collection) {
        setLoading(true);
        setError(null);
        try {
          const uploads = await CollectionService.getCollectionUploads(
            collection.id
          );
          setCollectionUploads(uploads);
        } catch (err) {
          setError("Failed to fetch collection uploads");
          console.error("Error fetching collection uploads:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setCollectionUploads([]);
      }
    },
    []
  );

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  return {
    collections,
    selectedCollection,
    collectionUploads,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    addUploadToCollection,
    removeUploadFromCollection,
    selectCollection,
    refreshCollections,
  };
};
