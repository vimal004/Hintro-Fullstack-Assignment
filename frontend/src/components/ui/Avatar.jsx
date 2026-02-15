import "./Avatar.css";

export default function Avatar({
  user,
  size = "md",
  className = "",
  showTooltip = true,
}) {
  const sizeMap = { sm: 28, md: 36, lg: 48, xl: 64 };
  const fontMap = { sm: "11px", md: "13px", lg: "16px", xl: "22px" };
  const dim = sizeMap[size] || 36;

  if (!user) return null;

  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      style={{
        width: dim,
        height: dim,
        backgroundColor: user.color || "#1a73e8",
        fontSize: fontMap[size],
      }}
      title={showTooltip ? user.name : undefined}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="avatar__img" />
      ) : (
        <span className="avatar__initials">{user.initials}</span>
      )}
    </div>
  );
}

export function AvatarGroup({ users = [], max = 3, size = "sm" }) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="avatar-group">
      {visible.map((user) => (
        <Avatar key={user.id} user={user} size={size} />
      ))}
      {remaining > 0 && (
        <div
          className={`avatar avatar--${size} avatar--more`}
          style={{
            width: size === "sm" ? 28 : 36,
            height: size === "sm" ? 28 : 36,
            fontSize: size === "sm" ? "11px" : "13px",
          }}
        >
          <span className="avatar__initials">+{remaining}</span>
        </div>
      )}
    </div>
  );
}
