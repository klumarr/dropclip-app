import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Collection } from "../../types/collections";
import { Upload } from "../../types/uploads";
import { formatDate } from "../../utils/format";
import { ApprovedContent } from "../moderation/ApprovedContent";

interface CollectionsProps {
  collections: Collection[];
  selectedCollection: Collection | null;
  collectionUploads: Upload[];
  loading: boolean;
  onCreateCollection: (name: string, description?: string) => Promise<void>;
  onUpdateCollection: (
    collectionId: string,
    updates: Partial<Collection>
  ) => Promise<void>;
  onDeleteCollection: (collectionId: string) => Promise<void>;
  onSelectCollection: (collection: Collection | null) => void;
  onDownloadUpload: (uploadId: string) => void;
  onRemoveUpload: (collectionId: string, uploadId: string) => Promise<void>;
}

interface CollectionDialogProps {
  open: boolean;
  collection?: Collection;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => void;
}

const CollectionDialog: React.FC<CollectionDialogProps> = ({
  open,
  collection,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description || undefined);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {collection ? "Edit Collection" : "Create Collection"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {collection ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const Collections: React.FC<CollectionsProps> = ({
  collections,
  selectedCollection,
  collectionUploads,
  loading,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onSelectCollection,
  onDownloadUpload,
  onRemoveUpload,
}) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<
    Collection | undefined
  >();

  const handleCreateCollection = async (name: string, description?: string) => {
    await onCreateCollection(name, description);
  };

  const handleUpdateCollection = async (name: string, description?: string) => {
    if (editingCollection) {
      await onUpdateCollection(editingCollection.id, { name, description });
    }
  };

  const handleOpenDialog = (collection?: Collection) => {
    setEditingCollection(collection);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingCollection(undefined);
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (selectedCollection) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => onSelectCollection(null)}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Back to Collections
          </Button>
          <Typography variant="h5" component="span">
            {selectedCollection.name}
          </Typography>
        </Box>
        <ApprovedContent
          uploads={collectionUploads}
          onDownload={onDownloadUpload}
          onRemoveFromCollection={(uploadId) =>
            onRemoveUpload(selectedCollection.id, uploadId)
          }
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">My Collections</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Collection
        </Button>
      </Box>

      <Grid container spacing={2}>
        {collections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} key={collection.id}>
            <Card>
              <CardMedia
                component="div"
                sx={{
                  height: 140,
                  bgcolor: "background.default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h3" color="text.secondary">
                  {collection.uploadCount}
                </Typography>
              </CardMedia>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {collection.name}
                </Typography>
                {collection.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {collection.description}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Last updated: {formatDate(collection.modifiedAt)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Tooltip title="View Collection">
                    <IconButton
                      size="small"
                      onClick={() => onSelectCollection(collection)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Collection">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(collection)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Collection">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteCollection(collection.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CollectionDialog
        open={dialogOpen}
        collection={editingCollection}
        onClose={handleCloseDialog}
        onSubmit={
          editingCollection ? handleUpdateCollection : handleCreateCollection
        }
      />
    </Box>
  );
};
