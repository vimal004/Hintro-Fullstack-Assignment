import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, LayoutDashboard, Clock, Users } from "lucide-react";
import useBoardStore from "../store/boardStore";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";
import { AvatarGroup } from "../components/ui/Avatar";
import "./BoardsPage.css";

export default function BoardsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const boards = useBoardStore((s) => s.boards);
  const searchQuery = useBoardStore((s) => s.searchQuery);
  const setSearchQuery = useBoardStore((s) => s.setSearchQuery);
  const fetchBoards = useBoardStore((s) => s.fetchBoards);
  const createBoard = useBoardStore((s) => s.createBoard);
  const currentPage = useBoardStore((s) => s.currentPage);
  const setCurrentPage = useBoardStore((s) => s.setCurrentPage);
  const totalPages = useBoardStore((s) => s.totalPages);
  const totalBoards = useBoardStore((s) => s.totalBoards);
  const isLoading = useBoardStore((s) => s.isLoading);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#1a73e8");

  // Fetch boards on mount and when search changes
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards, searchQuery, currentPage]);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreateModal(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Debounced search
  const [localSearch, setLocalSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const board = await createBoard(newTitle.trim(), newDesc.trim(), newColor);
    setNewTitle("");
    setNewDesc("");
    setNewColor("#1a73e8");
    setShowCreateModal(false);
    if (board) navigate(`/boards/${board.id}`);
  };

  const boardColors = [
    "#1a73e8",
    "#a142f4",
    "#1e8e3e",
    "#e8710a",
    "#d93025",
    "#f9ab00",
  ];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="boards-page">
      {/* ── Header ──── */}
      <div className="boards-page__header">
        <div>
          <h1 className="boards-page__title">Your Boards</h1>
          <p className="boards-page__subtitle">
            {totalBoards} board{totalBoards !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          New Board
        </Button>
      </div>

      {/* ── Board Grid ──── */}
      {isLoading ? (
        <div className="boards-page__loading">
          <div className="loading-spinner" />
          <p>Loading boards…</p>
        </div>
      ) : boards.length > 0 ? (
        <>
          <div className="boards-grid">
            {boards.map((board, i) => {
              const memberUsers = board.members || [];
              return (
                <div
                  key={board.id}
                  className="board-card"
                  onClick={() => navigate(`/boards/${board.id}`)}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className="board-card__accent"
                    style={{ backgroundColor: board.color }}
                  />
                  <div className="board-card__body">
                    <h3 className="board-card__title">{board.title}</h3>
                    <p className="board-card__desc">{board.description}</p>
                    <div className="board-card__meta">
                      <div className="board-card__meta-item">
                        <Clock size={14} />
                        <span>
                          {formatDate(board.updated_at || board.updatedAt)}
                        </span>
                      </div>
                      <div className="board-card__meta-item">
                        <Users size={14} />
                        <span>
                          {Array.isArray(memberUsers) ? memberUsers.length : 0}
                        </span>
                      </div>
                    </div>
                    <div className="board-card__footer">
                      <AvatarGroup users={memberUsers} max={3} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ──── */}
          {totalPages > 1 && (
            <div className="boards-page__pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`pagination__btn ${currentPage === i + 1 ? "pagination__btn--active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={LayoutDashboard}
          title={searchQuery ? "No boards found" : "No boards yet"}
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Create your first board to start organizing tasks with your team."
          }
          actionLabel={!searchQuery ? "Create Board" : undefined}
          onAction={!searchQuery ? () => setShowCreateModal(true) : undefined}
        />
      )}

      {/* ── Create Board Modal ──── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create new board"
        size="sm"
      >
        <div className="create-board-form">
          <Input
            label="Board name"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Product Launch Q2"
            required
            autoFocus
          />
          <Input
            label="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="What's this board about?"
          />
          <div className="create-board-form__colors">
            <label className="input-group__label">Color</label>
            <div className="color-picker">
              {boardColors.map((c) => (
                <button
                  key={c}
                  className={`color-picker__swatch ${newColor === c ? "color-picker__swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="create-board-form__actions">
            <Button variant="text" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newTitle.trim()}
            >
              Create Board
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
