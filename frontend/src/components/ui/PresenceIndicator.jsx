import useSocketStore from "../../store/socketStore";
import "./PresenceIndicator.css";

export default function PresenceIndicator() {
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const isConnected = useSocketStore((s) => s.isConnected);

  if (!isConnected) {
    return (
      <div className="presence-indicator presence-indicator--disconnected">
        <span className="presence-dot presence-dot--offline"></span>
        <span className="presence-text">Reconnecting…</span>
      </div>
    );
  }

  const uniqueUsers = onlineUsers.filter(
    (u, i, arr) => arr.findIndex((x) => x.userId === u.userId) === i,
  );

  if (uniqueUsers.length <= 1) {
    return (
      <div className="presence-indicator">
        <span className="presence-dot presence-dot--online"></span>
        <span className="presence-text">Only you</span>
      </div>
    );
  }

  return (
    <div className="presence-indicator">
      <span className="presence-dot presence-dot--online presence-dot--pulsing"></span>
      <div className="presence-avatars">
        {uniqueUsers.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="presence-avatar"
            style={{ backgroundColor: user.color || "#1a73e8" }}
            title={user.name || user.email}
          >
            {user.initials ||
              (user.name || user.email || "?").charAt(0).toUpperCase()}
          </div>
        ))}
        {uniqueUsers.length > 5 && (
          <div className="presence-avatar presence-avatar--overflow">
            +{uniqueUsers.length - 5}
          </div>
        )}
      </div>
      <span className="presence-text">{uniqueUsers.length} online</span>
    </div>
  );
}
