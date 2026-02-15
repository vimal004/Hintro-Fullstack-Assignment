import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  onClick,
  ...props
}) {
  const classNames = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && "btn--full",
    loading && "btn--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {Icon && iconPosition === "left" && !loading && (
        <Icon className="btn__icon" size={size === "sm" ? 16 : 18} />
      )}
      {children && <span className="btn__label">{children}</span>}
      {Icon && iconPosition === "right" && !loading && (
        <Icon className="btn__icon" size={size === "sm" ? 16 : 18} />
      )}
    </button>
  );
}
