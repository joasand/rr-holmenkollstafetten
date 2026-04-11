import { useState } from 'react';

export function FilterGroup({ title, options, selected, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="filter-group">
      <button
        type="button"
        className="filter-group-toggle"
        onClick={() => setOpen(!open)}
      >
        <span className={`filter-arrow ${open ? 'open' : ''}`}>&#9654;</span>
        {title}
      </button>
      {open && (
        <div className="filter-group-options">
          {options.map((opt) => (
            <label key={opt} className="filter-option">
              <input
                type="checkbox"
                checked={selected.has(opt)}
                onChange={() => onToggle(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
