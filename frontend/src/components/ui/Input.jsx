import "./Input.css";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  fullWidth = true,
  disabled = false,
  required = false,
  className = "",
  id,
  ...props
}) {
  const inputId =
    id || `input-${label?.replace(/\s/g, "-").toLowerCase() || "field"}`;

  return (
    <div
      className={`input-group ${fullWidth ? "input-group--full" : ""} ${error ? "input-group--error" : ""} ${className}`}
    >
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
          {required && <span className="input-group__required">*</span>}
        </label>
      )}
      <div className="input-group__wrapper">
        {Icon && <Icon className="input-group__icon" size={18} />}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input-group__input ${Icon ? "input-group__input--with-icon" : ""}`}
          {...props}
        />
      </div>
      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
}
