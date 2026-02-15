import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useBoardStore from "../../store/boardStore";
import useAuthStore from "../../store/authStore";
import Avatar from "../ui/Avatar";
import "./Sidebar.css";

export default function Sidebar({ collapsed, onToggle }) {
  const boards = useBoardStore((s) => s.boards);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
        <NavLink
          to="/boards"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>All Boards</span>}
        </NavLink>
      </nav>

      {/* ── Boards List ──── */}
      {!collapsed && (
        <div className="sidebar__section">
          <div className="sidebar__section-header">
            <span className="sidebar__section-title">Your Boards</span>
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
    </aside>
  );
}
