import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus, ArrowLeft, Users, Activity } from "lucide-react";
import useBoardStore from "../store/boardStore";
import useSocketStore from "../store/socketStore";
import BoardList from "../components/board/BoardList";
import TaskModal from "../components/board/TaskModal";
import Button from "../components/ui/Button";
import { AvatarGroup } from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import "./BoardDetailPage.css";

export default function BoardDetailPage() {
  const { id: boardId } = useParams();
  const navigate = useNavigate();

  const {
    boards,
    lists,
    users,
    setActiveBoard,
    moveTask,
    createList,
    getBoardActivities,
  } = useBoardStore();
  const { joinBoard, leaveBoard } = useSocketStore();

  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  const board = boards.find((b) => b.id === boardId);
  const boardLists = lists[boardId] || [];
  const activities = getBoardActivities(boardId);

  useEffect(() => {
    setActiveBoard(boardId);
    joinBoard(boardId);
    return () => leaveBoard(boardId);
  }, [boardId, setActiveBoard, joinBoard, leaveBoard]);

  if (!board) {
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

  const memberUsers = board.members
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    moveTask(
      boardId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index,
    );
  };

  const handleAddList = () => {
    if (!newListTitle.trim()) return;
    createList(boardId, newListTitle.trim());
    setNewListTitle("");
    setShowAddList(false);
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
            <h1 className="board-detail__title">{board.title}</h1>
            <p className="board-detail__desc">{board.description}</p>
          </div>
        </div>
        <div className="board-detail__header-right">
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
                  const actUser = users.find((u) => u.id === act.userId);
                  return (
                    <div key={act.id} className="board-detail__activity-item">
                      <div
                        className="board-detail__activity-dot"
                        style={{ backgroundColor: actUser?.color || "#1a73e8" }}
                      />
                      <div className="board-detail__activity-content">
                        <p>{act.detail}</p>
                        <span>{formatTime(act.timestamp)}</span>
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
