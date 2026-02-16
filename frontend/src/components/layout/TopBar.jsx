import { Menu } from "lucide-react";
import SearchBar from "../ui/SearchBar";
import Avatar from "../ui/Avatar";
import NotificationPanel from "../notifications/NotificationPanel";
import useAuthStore from "../../store/authStore";
import useBoardStore from "../../store/boardStore";
import useSocketStore from "../../store/socketStore";
import "./TopBar.css";

export default function TopBar({ onMenuClick, title }) {
  const user = useAuthStore((s) => s.user);
  const searchQuery = useBoardStore((s) => s.searchQuery);
  const setSearchQuery = useBoardStore((s) => s.setSearchQuery);
  const isConnected = useSocketStore((s) => s.isConnected);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        {title && <h2 className="topbar__title">{title}</h2>}
      </div>

      <div className="topbar__center">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search boards, tasks…"
          className="topbar__search"
        />
      </div>

      <div className="topbar__right">
        <div
          className="topbar__status"
          title={isConnected ? "Connected" : "Connecting…"}
        >
          <span
            className={`topbar__dot ${isConnected ? "topbar__dot--online" : ""}`}
          />
        </div>
        <NotificationPanel />
        <Avatar user={user} size="sm" />
      </div>
    </header>
  );
}
