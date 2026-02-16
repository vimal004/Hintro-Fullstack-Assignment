import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
} from "lucide-react";
import useBoardStore from "../../store/boardStore";
import useAuthStore from "../../store/authStore";
import useTeamStore from "../../store/teamStore";
import Avatar from "../ui/Avatar";
import TeamModal from "../team/TeamModal";
import InviteModal from "../team/InviteModal";
import "./Sidebar.css";

export default function Sidebar({ collapsed, onToggle }) {
  const boards = useBoardStore((s) => s.boards);
  const fetchBoards = useBoardStore((s) => s.fetchBoards);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { teams, fetchMyTeams, selectedTeamId, setSelectedTeamId } =
    useTeamStore();
  const navigate = useNavigate();

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Fetch boards and teams on mount
  useEffect(() => {
    fetchBoards();
    fetchMyTeams();
  }, [fetchBoards, fetchMyTeams]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInviteClick = (e, team) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTeam(team);
    setShowInviteModal(true);
  };

  const handleTeamClick = (teamId) => {
    setSelectedTeamId(teamId);
    navigate("/boards");
    // fetchBoards will be triggered by the BoardsPage useEffect
  };

  const handleAllBoardsClick = () => {
    setSelectedTeamId(null);
    navigate("/boards");
  };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* ── Logo ──── */}
      <div className="sidebar__header">
        <NavLink to="/" className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <LayoutDashboard size={22} />
          </div>
          {!collapsed && <span className="sidebar__logo-text">TaskFlow</span>}
        </NavLink>
        <button
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ── Navigation ──── */}
      <nav className="sidebar__nav">
        <button
          onClick={handleAllBoardsClick}
          className={`sidebar__link ${selectedTeamId === null ? "sidebar__link--active" : ""}`}
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>All Boards</span>}
        </button>
      </nav>

      <div className="sidebar__content-scroll">
        {/* ── Teams Section ──── */}
        {!collapsed && (
          <div className="sidebar__section">
            <div className="sidebar__section-header">
              <span className="sidebar__section-title">Teams</span>
              <button
                className="sidebar__add-btn"
                onClick={() => setShowTeamModal(true)}
                aria-label="Create team"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="sidebar__boards">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={`sidebar__team-item ${selectedTeamId === team.id ? "sidebar__team-item--active" : ""}`}
                  onClick={() => handleTeamClick(team.id)}
                >
                  <div className="sidebar__team-info">
                    <Users size={16} />
                    <span className="sidebar__team-name">{team.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleInviteClick(e, team)}
                    className="sidebar__team-invite-btn"
                    title="Invite members"
                  >
                    <UserPlus size={14} />
                  </button>
                </div>
              ))}
              {teams.length === 0 && (
                <div className="sidebar__empty-text">No teams yet</div>
              )}
            </div>
          </div>
        )}

        {/* ── Boards List ──── */}
        {!collapsed && (
          <div className="sidebar__section">
            <div className="sidebar__section-header">
              <span className="sidebar__section-title">
                {selectedTeamId && selectedTeamId !== "personal"
                  ? `${teams.find((t) => t.id === selectedTeamId)?.name || "Team"} Boards`
                  : "Your Boards"}
              </span>
              <button
                className="sidebar__add-btn"
                onClick={() => navigate("/boards?create=true")}
                aria-label="Create board"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="sidebar__boards">
              {boards.map((board) => (
                <NavLink
                  key={board.id}
                  to={`/boards/${board.id}`}
                  className={({ isActive }) =>
                    `sidebar__board ${isActive ? "sidebar__board--active" : ""}`
                  }
                >
                  <span
                    className="sidebar__board-dot"
                    style={{ backgroundColor: board.color }}
                  />
                  <span className="sidebar__board-title">{board.title}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── User Footer ──── */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <Avatar user={user} size="sm" />
          {!collapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.name}</span>
              <span className="sidebar__user-email">{user?.email}</span>
            </div>
          )}
        </div>
        <button
          className="sidebar__logout"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* ── Modals ──── */}
      <TeamModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
      />
      {selectedTeam && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedTeam(null);
          }}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
        />
      )}
    </aside>
  );
}
