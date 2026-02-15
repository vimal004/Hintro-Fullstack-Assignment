import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import "./SearchBar.css";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <div
      className={`search-bar ${focused ? "search-bar--focused" : ""} ${className}`}
    >
      <Search className="search-bar__icon" size={18} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-bar__input"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
