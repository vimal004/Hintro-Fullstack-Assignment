import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  LayoutDashboard,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useBoardStore from "../store/boardStore";
import useTeamStore from "../store/teamStore";
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

  const { teams, selectedTeamId } = useTeamStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#1a73e8");
  const [selectedTeamIdForCreate, setSelectedTeamIdForCreate] = useState("");

  // Fetch boards on mount and when search/page/team changes
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards, searchQuery, currentPage, selectedTeamId]);

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

  // Pre-select the current team when creating a board
  useEffect(() => {
    if (selectedTeamId && selectedTeamId !== "personal") {
      setSelectedTeamIdForCreate(selectedTeamId);
    } else {
      setSelectedTeamIdForCreate("");
    }
  }, [selectedTeamId]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const board = await createBoard(
      newTitle.trim(),
      newDesc.trim(),
      newColor,
      selectedTeamIdForCreate || null,
    );
    setNewTitle("");
    setNewDesc("");
    setNewColor("#1a73e8");
    setSelectedTeamIdForCreate("");
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

  // Dynamic header based on selected team
  const selectedTeamName = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId)?.name || "Team"
    : null;
  const pageTitle = selectedTeamName
    ? `${selectedTeamName} Boards`
    : "Your Boards";
  const pageSubtitle = selectedTeamName
    ? `${totalBoards} board${totalBoards !== 1 ? "s" : ""} in ${selectedTeamName}`
    : `${totalBoards} board${totalBoards !== 1 ? "s" : ""} in your workspace`;

  return (
    <div className="boards-page">
      {/* ── Header ──── */}
      <div className="boards-page__header">
        <div>
          <h1 className="boards-page__title">{pageTitle}</h1>
          <p className="boards-page__subtitle">{pageSubtitle}</p>
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
              <button
                className="pagination__btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                title="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="pagination__info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination__btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                title="Next Page"
              >
                <ChevronRight size={20} />
              </button>
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

          {teams.length > 0 && (
            <div className="input-group">
              <label className="input-group__label">Team (Optional)</label>
              <select
                className="input-group__input"
                value={selectedTeamIdForCreate}
                onChange={(e) => setSelectedTeamIdForCreate(e.target.value)}
                style={{ height: "40px" }}
              >
                <option value="">Personal Board</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
