import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Drawer,
  styled,
} from "@mui/material";
import { DragHandle, PlayArrow, Clear, QueueMusic } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Video } from "../../types";

const QueueDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: "100%",
    maxWidth: 480,
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
  },
}));

const QueueHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}));

const QueueItem = styled(ListItem)<{ isDragging: boolean }>(
  ({ theme, isDragging }) => ({
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    backgroundColor: isDragging ? theme.palette.action.selected : "transparent",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  })
);

interface VideoQueueProps {
  open: boolean;
  onClose: () => void;
  videos: Video[];
  currentVideoId: string;
  onVideoSelect: (videoId: string) => void;
  onQueueReorder: (videos: Video[]) => void;
  onRemoveFromQueue: (videoId: string) => void;
}

export const VideoQueue = ({
  open,
  onClose,
  videos,
  currentVideoId,
  onVideoSelect,
  onQueueReorder,
  onRemoveFromQueue,
}: VideoQueueProps) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onQueueReorder(items);
  };

  return (
    <QueueDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
    >
      <QueueHeader>
        <QueueMusic />
        <Typography variant="h6">Play Queue</Typography>
      </QueueHeader>

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Now Playing
        </Typography>
        {videos.find((v) => v.id === currentVideoId) && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <ListItemText
              primary={videos.find((v) => v.id === currentVideoId)?.title}
              secondary={
                videos.find((v) => v.id === currentVideoId)?.creator ||
                "Unknown creator"
              }
            />
          </Paper>
        )}

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Next in Queue
        </Typography>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="queue">
            {(provided) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {videos
                  .filter((v) => v.id !== currentVideoId)
                  .map((video, index) => (
                    <Draggable
                      key={video.id}
                      draggableId={video.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <QueueItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          isDragging={snapshot.isDragging}
                        >
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mr: 2,
                            }}
                          >
                            <DragHandle />
                          </Box>
                          <ListItemText
                            primary={video.title}
                            secondary={video.creator}
                            sx={{ mr: 2 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => onVideoSelect(String(video.id))}
                          >
                            <PlayArrow />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onRemoveFromQueue(String(video.id))}
                          >
                            <Clear />
                          </IconButton>
                        </QueueItem>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </QueueDrawer>
  );
};
