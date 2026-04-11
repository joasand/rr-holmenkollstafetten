import { useMemo, useState } from 'react';
import { RaceData } from './data-import';
import { FilterGroup } from './FilterGroup';

const yVar = 'etappe';
const sortVar = 'etappe_nr';

export function Sidebar({ filters, onFiltersChange }) {
  return (
    <aside className="sidebar">
      <h2>Filter</h2>
      {filters.map(({ key, title, options, selected }) => (
        <FilterGroup
          key={key}
          title={title}
          options={options}
          selected={selected}
          onToggle={(v) => onFiltersChange(key, v)}
        />
      ))}
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

  const filters = [
    { key: 'year', title: 'År', options: filterOptions.year, selected: selectedYears },
    { key: 'team', title: 'Lag', options: filterOptions.team, selected: selectedTeams },
    { key: 'etappe', title: 'Etappe', options: filterOptions.etappe, selected: selectedEtapper },
    { key: 'loper_kjent', title: 'Kjent løper', options: filterOptions.loper_kjent, selected: selectedLoperKjent },
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

  return { filters, handleToggle, filterData, activeEtapper, selectedYears, selectedTeams, selectedEtapper, selectedLoperKjent };
}
