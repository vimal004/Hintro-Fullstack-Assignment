import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import {
  Plus,
  ArrowLeft,
  Users,
  Activity,
  Loader,
  Star,
  Copy,
} from "lucide-react";
import useBoardStore from "../store/boardStore";
import useSocketStore from "../store/socketStore";
import BoardList from "../components/board/BoardList";
import TaskModal from "../components/board/TaskModal";
import Button from "../components/ui/Button";
import { AvatarGroup } from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import PresenceIndicator from "../components/ui/PresenceIndicator";
import "./BoardDetailPage.css";

export default function BoardDetailPage() {
  const { id: boardId } = useParams();
  const navigate = useNavigate();

  const boardDetail = useBoardStore((s) => s.boardDetail);
  const isBoardLoading = useBoardStore((s) => s.isBoardLoading);
  const fetchBoardDetail = useBoardStore((s) => s.fetchBoardDetail);
  const fetchActivities = useBoardStore((s) => s.fetchActivities);
  const fetchUsers = useBoardStore((s) => s.fetchUsers);
  const moveTask = useBoardStore((s) => s.moveTask);
  const createList = useBoardStore((s) => s.createList);
  const toggleFavorite = useBoardStore((s) => s.toggleFavorite);
  const duplicateBoard = useBoardStore((s) => s.duplicateBoard);
  const isFavorited = useBoardStore((s) => s.isFavorited(boardId));
  const activities = useBoardStore((s) => s.activities);

  const { joinBoard, leaveBoard, emitEvent } = useSocketStore();

  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    fetchBoardDetail(boardId);
    fetchUsers();
    joinBoard(boardId);
    return () => leaveBoard(boardId);
  }, [boardId, fetchBoardDetail, fetchUsers, joinBoard, leaveBoard]);

  useEffect(() => {
    if (showActivity) {
      fetchActivities(boardId);
    }
  }, [showActivity, boardId, fetchActivities]);

  if (isBoardLoading) {
    return (
      <div
        className="board-detail"
        style={{
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader size={24} className="spin" />
        <span style={{ marginLeft: 8 }}>Loading board…</span>
      </div>
    );
  }

  if (!boardDetail || boardDetail.id !== boardId) {
    return (
      <div className="board-detail" style={{ padding: "2rem" }}>
        <EmptyState
          icon={ArrowLeft}
          title="Board not found"
          description="This board may have been deleted or moved."
          actionLabel="Go to Boards"
          onAction={() => navigate("/boards")}
        />
      </div>
    );
  }

  const board = boardDetail;
  const boardLists = board.lists || [];
  const memberUsers = board.members || [];

  const addToast = useSocketStore((s) => s._addToast);
  const [lastConfetti, setLastConfetti] = useState(0);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // Check for "Done" list (completion)
    const destList = boardLists.find((l) => l.id === destination.droppableId);
    if (destList) {
      const title = destList.title.toLowerCase();
      const isDone =
        title === "done" ||
        title === "completed" ||
        title === "finished" ||
        title.includes("complete");

      if (isDone) {
        // Debounce confetti slightly to avoid spam
        const now = Date.now();
        if (now - lastConfetti > 1000) {
          import("../utils/confetti").then(({ triggerFireworks }) => {
            triggerFireworks();
          });
          if (addToast) addToast("Task completed! 🎉");
          setLastConfetti(now);
        }
      }
    }

    moveTask(
      boardId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index,
    );
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    await createList(boardId, newListTitle.trim());
    setNewListTitle("");
    setShowAddList(false);
  };

  const handleDuplicate = async () => {
    if (window.confirm("Make a copy of this board?")) {
      const newBoard = await duplicateBoard(boardId);
      if (newBoard) navigate(`/boards/${newBoard.id}`);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="board-detail">
      {/* ── Header ──── */}
      <div className="board-detail__header">
        <div className="board-detail__header-left">
          <button
            className="board-detail__back"
            onClick={() => navigate("/boards")}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 className="board-detail__title">{board.title}</h1>
              <button
                className={`board-detail__star ${isFavorited ? "board-detail__star--active" : ""}`}
                onClick={() => toggleFavorite(boardId)}
                title={isFavorited ? "Unstar board" : "Star board"}
              >
                <Star
                  size={18}
                  fill={isFavorited ? "#f9ab00" : "none"}
                  stroke={isFavorited ? "#f9ab00" : "currentColor"}
                />
              </button>
            </div>
            <p className="board-detail__desc">{board.description}</p>
          </div>
        </div>
        <div className="board-detail__header-right">
          <PresenceIndicator /> {/* Real-time presence */}
          <div className="board-detail__divider" />
          <AvatarGroup users={memberUsers} max={4} size="sm" />
          <Button
            variant={showActivity ? "secondary" : "ghost"}
            icon={Activity}
            size="sm"
            onClick={() => setShowActivity((p) => !p)}
          >
            Activity
          </Button>
        </div>
      </div>

      <div className="board-detail__body">
        {/* ── Columns ──── */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="board-detail__columns">
            {boardLists.map((list) => (
              <BoardList key={list.id} list={list} boardId={boardId} />
            ))}

            {/* Add List */}
            {showAddList ? (
              <div className="board-detail__add-list-form">
                <input
                  className="board-detail__add-list-input"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="List title…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddList();
                    if (e.key === "Escape") setShowAddList(false);
                  }}
                  autoFocus
                />
                <div className="board-detail__add-list-actions">
                  <button
                    className="board-detail__add-list-confirm"
                    onClick={handleAddList}
                  >
                    Add
                  </button>
                  <button
                    className="board-detail__add-list-cancel"
                    onClick={() => setShowAddList(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="board-detail__add-list-btn"
                onClick={() => setShowAddList(true)}
              >
                <Plus size={18} />
                Add list
              </button>
            )}
          </div>
        </DragDropContext>

        {/* ── Activity Sidebar ──── */}
        {showActivity && (
          <div className="board-detail__activity-panel">
            <div className="board-detail__activity-header">
              <h3>Activity</h3>
              <button onClick={() => setShowActivity(false)}>
                <ArrowLeft size={16} />
              </button>
            </div>
            <div className="board-detail__activity-list">
              {activities.length > 0 ? (
                activities.slice(0, 20).map((act) => {
                  const actUser = act.user || {};
                  return (
                    <div key={act.id} className="board-detail__activity-item">
                      <div
                        className="board-detail__activity-dot"
                        style={{ backgroundColor: actUser?.color || "#1a73e8" }}
                      />
                      <div className="board-detail__activity-content">
                        <p>{act.detail}</p>
                        <span>{formatTime(act.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="board-detail__no-activity">No activity yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal />
    </div>
  );
}
