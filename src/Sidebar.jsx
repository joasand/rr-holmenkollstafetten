import { useMemo, useState } from 'react';
import { RaceData } from './data-import';
import { FilterGroup } from './FilterGroup';

const yVar = 'etappe';
const sortVar = 'etappe_nr';

function DeltakerSearch({ allNames, selected, onToggle }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allNames.filter(n => n.toLowerCase().includes(q)).slice(0, 20);
  }, [query, allNames]);

  return (
    <div className="filter-group">
      <button type="button" className="filter-group-toggle" onClick={() => setOpen(!open)}>
        <span className={`filter-arrow ${open ? 'open' : ''}`}>&#9654;</span>
        Søk løper
      </button>
      {open && (
        <div className="filter-group-options">
          <input
            type="text"
            className="deltaker-search-input"
            placeholder="Skriv navn..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {matches.map(name => (
            <label key={name} className="filter-option">
              <input type="checkbox" checked={selected.has(name)} onChange={() => onToggle(name)} />
              {name}
            </label>
          ))}
          {selected.size > 0 && (
            <div className="deltaker-selected">
              <span className="deltaker-selected-label">Valgt:</span>
              {[...selected].map(name => (
                <span key={name} className="deltaker-tag">
                  {name}
                  <button type="button" onClick={() => onToggle(name)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ filters, onFiltersChange, onSelectAll, onClearAll, filteredCount, totalCount,
  highlights, onHighlightToggle, deltaker, onDeltakerToggle }) {
  return (
    <aside className="sidebar">
      <h2>Filtrering</h2>
      <p className="filter-description">Velg hvilke data som skal vises i diagrammet.</p>
      <p className="filter-count">Viser {filteredCount} av {totalCount} løpstider</p>
      {filters.map(({ key, title, options, selected }) => (
        <FilterGroup
          key={key}
          title={title}
          options={options}
          selected={selected}
          onToggle={(v) => onFiltersChange(key, v)}
          onSelectAll={(key === 'etappe' || key === 'year') ? () => onSelectAll(key) : undefined}
          onClearAll={(key === 'etappe' || key === 'year') ? () => onClearAll(key) : undefined}
        />
      ))}

      <h2 style={{ marginTop: 20 }}>Fremheving</h2>
      <p className="filter-description">Fremhev bestemte grupper eller løpere i diagrammet.</p>
      {highlights.map(({ key, title, options, selected }) => (
        <FilterGroup
          key={key}
          title={title}
          options={options}
          selected={selected}
          onToggle={(v) => onHighlightToggle(key, v)}
        />
      ))}
      <DeltakerSearch
        allNames={deltaker.options}
        selected={deltaker.selected}
        onToggle={onDeltakerToggle}
      />
    </aside>
  );
}

export function useFilters() {
  const filterOptions = useMemo(() => ({
    year: [...new Set(RaceData.map(d => d.year))].sort(),
    team: [...new Set(RaceData.map(d => d.team))].sort(),
    etappe: [...new Map(RaceData.map(d => [d[yVar], d[sortVar]])).entries()]
      .sort((a, b) => Number(a[1]) - Number(b[1]))
      .map(([name]) => name),
    loper_kjent: [...new Set(RaceData.map(d => d.loper_kjent))].sort(),
  }), []);

  const [selectedYears, setSelectedYears] = useState(() => new Set(filterOptions.year));
  const [selectedTeams, setSelectedTeams] = useState(() => new Set(filterOptions.team));
  const [selectedEtapper, setSelectedEtapper] = useState(() => new Set(filterOptions.etappe));
  const [selectedLoperKjent, setSelectedLoperKjent] = useState(() => new Set(filterOptions.loper_kjent));

  const setters = { year: setSelectedYears, team: setSelectedTeams, etappe: setSelectedEtapper, loper_kjent: setSelectedLoperKjent };

  const handleToggle = (key, value) => {
    setters[key](prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handleSelectAll = (key) => {
    setters[key](() => new Set(filterOptions[key]));
  };

  const handleClearAll = (key) => {
    setters[key](() => new Set());
  };

  const filters = [
    { key: 'year', title: 'År', options: filterOptions.year, selected: selectedYears },
    { key: 'team', title: 'Lag', options: filterOptions.team, selected: selectedTeams },
    { key: 'etappe', title: 'Etappe', options: filterOptions.etappe, selected: selectedEtapper },
    { key: 'loper_kjent', title: 'Navngitt løper', options: filterOptions.loper_kjent, selected: selectedLoperKjent },
  ];

  const filterData = (data) =>
    data.filter(d =>
      selectedYears.has(d.year) &&
      selectedTeams.has(d.team) &&
      selectedEtapper.has(d[yVar]) &&
      selectedLoperKjent.has(d.loper_kjent)
    );

  const activeEtapper = useMemo(() =>
    filterOptions.etappe.filter(e => selectedEtapper.has(e)),
    [filterOptions.etappe, selectedEtapper]
  );

  return { filters, handleToggle, handleSelectAll, handleClearAll, filterData, activeEtapper, selectedYears, selectedTeams, selectedEtapper, selectedLoperKjent };
}

export function useHighlights() {
  const highlightOptions = useMemo(() => ({
    year: [...new Set(RaceData.map(d => d.year))].sort(),
    team: [...new Set(RaceData.map(d => d.team))].sort(),
    loper_kjent: [...new Set(RaceData.map(d => d.loper_kjent))].sort(),
  }), []);

  const allDeltaker = useMemo(() =>
    [...new Set(RaceData.map(d => d.etappe_deltaker))].sort(),
  []);

  const [hlYear, setHlYear] = useState(() => new Set());
  const [hlTeam, setHlTeam] = useState(() => new Set());
  const [hlLoperKjent, setHlLoperKjent] = useState(() => new Set());
  const [hlDeltaker, setHlDeltaker] = useState(() => new Set());

  const hlSetters = { year: setHlYear, team: setHlTeam, loper_kjent: setHlLoperKjent };

  const handleHighlightToggle = (key, value) => {
    hlSetters[key](prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handleDeltakerToggle = (name) => {
    setHlDeltaker(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const highlights = [
    { key: 'year', title: 'År', options: highlightOptions.year, selected: hlYear },
    { key: 'team', title: 'Lag', options: highlightOptions.team, selected: hlTeam },
    { key: 'loper_kjent', title: 'Navngitt løper', options: highlightOptions.loper_kjent, selected: hlLoperKjent },
  ];

  const deltaker = { options: allDeltaker, selected: hlDeltaker };

  const hasAnyHighlight = hlYear.size > 0 || hlTeam.size > 0 || hlLoperKjent.size > 0 || hlDeltaker.size > 0;

  const isHighlighted = (d) => {
    if (!hasAnyHighlight) return true;
    if (hlYear.size > 0 && hlYear.has(d.year)) return true;
    if (hlTeam.size > 0 && hlTeam.has(d.team)) return true;
    if (hlLoperKjent.size > 0 && hlLoperKjent.has(d.loper_kjent)) return true;
    if (hlDeltaker.size > 0 && hlDeltaker.has(d.deltaker)) return true;
    return false;
  };

  return { highlights, handleHighlightToggle, deltaker, handleDeltakerToggle, isHighlighted };
}
