import { useState } from 'react';

export function FilterGroup({ title, options, selected, onToggle, onSelectAll, onClearAll }) {
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
          {onSelectAll && (
            <div className="filter-group-actions">
              <button type="button" onClick={onSelectAll}>Velg alle</button>
              <button type="button" onClick={onClearAll}>Fjern alle</button>
            </div>
          )}
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
