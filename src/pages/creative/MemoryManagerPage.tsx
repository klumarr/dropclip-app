import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  useTheme,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { Collections as CollectionsIcon } from "@mui/icons-material";
import { ModerationQueue } from "../../components/moderation/ModerationQueue";
import { ApprovedContent } from "../../components/moderation/ApprovedContent";
import { Collections } from "../../components/collections/Collections";
import { useModeration } from "../../hooks/useModeration";
import { useCollections } from "../../hooks/useCollections";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`memory-tabpanel-${index}`}
      aria-labelledby={`memory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const MemoryManagerPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const {
    pendingUploads,
    approvedUploads,
    rejectedUploads,
    loading: moderationLoading,
    error: moderationError,
    approveUpload,
    rejectUpload,
    downloadUpload,
    refreshUploads,
  } = useModeration();

  const {
    collections,
    selectedCollection,
    collectionUploads,
    loading: collectionsLoading,
    error: collectionsError,
    createCollection,
    updateCollection,
    deleteCollection,
    addUploadToCollection,
    removeUploadFromCollection,
    selectCollection,
  } = useCollections();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    refreshUploads();
  }, [refreshUploads]);

  useEffect(() => {
    const error = moderationError || collectionsError;
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: "error",
      });
    }
  }, [moderationError, collectionsError]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApprove = async (uploadId: string) => {
    await approveUpload(uploadId);
    setSnackbar({
      open: true,
      message: "Content approved successfully",
      severity: "success",
    });
  };

  const handleReject = async (uploadId: string) => {
    await rejectUpload(uploadId);
    setSnackbar({
      open: true,
      message: "Content rejected",
      severity: "success",
    });
  };

  const handleAddToCollection = async (uploadId: string) => {
    if (!selectedCollection) {
      setSnackbar({
        open: true,
        message: "Please select a collection first",
        severity: "error",
      });
      return;
    }

    try {
      await addUploadToCollection(selectedCollection.id, uploadId);
      setSnackbar({
        open: true,
        message: "Added to collection successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to add to collection",
        severity: "error",
      });
    }
  };

  const handleCreateCollection = async (name: string, description?: string) => {
    try {
      await createCollection(name, description);
      setSnackbar({
        open: true,
        message: "Collection created successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to create collection",
        severity: "error",
      });
    }
  };

  const handleUpdateCollection = async (
    collectionId: string,
    updates: Partial<Collection>
  ) => {
    try {
      await updateCollection(collectionId, updates);
      setSnackbar({
        open: true,
        message: "Collection updated successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update collection",
        severity: "error",
      });
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await deleteCollection(collectionId);
      setSnackbar({
        open: true,
        message: "Collection deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete collection",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (moderationLoading || collectionsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <CollectionsIcon sx={{ fontSize: 32, mr: 2, color: "primary.main" }} />
        <Typography variant="h4">Memory Manager</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="memory manager tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`Moderation Queue (${pendingUploads.length})`} />
          <Tab label={`Approved Content (${approvedUploads.length})`} />
          <Tab label={`Collections (${collections.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ModerationQueue
          uploads={pendingUploads}
          onApprove={handleApprove}
          onReject={handleReject}
          onDownload={downloadUpload}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ApprovedContent
          uploads={approvedUploads}
          onDownload={downloadUpload}
          onAddToCollection={handleAddToCollection}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Collections
          collections={collections}
          selectedCollection={selectedCollection}
          collectionUploads={collectionUploads}
          loading={collectionsLoading}
          onCreateCollection={handleCreateCollection}
          onUpdateCollection={handleUpdateCollection}
          onDeleteCollection={handleDeleteCollection}
          onSelectCollection={selectCollection}
          onDownloadUpload={downloadUpload}
          onRemoveUpload={removeUploadFromCollection}
        />
      </TabPanel>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MemoryManagerPage;
