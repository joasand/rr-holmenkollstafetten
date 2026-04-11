import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import './App.css'
import { RaceData } from './data-import';
import { AxisBottom } from './AxisBottom';
import { AxisTop } from './AxisTop';
import { Sidebar, useFilters } from './Sidebar';
import { Tooltip } from './Tooltip';
import { MARGIN, JITTER_WIDTH, WIDTH, BAND_HEIGHT, boundsWidth, X_VARIABLES } from './chartConfig';

const yVar = 'etappe';

function App() {
  const [xVar, setXVar] = useState('persentil_totalt');
  const varConfig = X_VARIABLES[xVar];

  const { filters, handleToggle, handleSelectAll, handleClearAll, filterData, activeEtapper,
    selectedYears, selectedTeams, selectedEtapper, selectedLoperKjent } = useFilters();

  const points = useMemo(() => {
    const rng = d3.randomLcg(42);
    return filterData(RaceData).map((d) => ({
      x: varConfig.getValue(d),
      y: d[yVar],
      year: d.year,
      team: d.team,
      deltaker: d.etappe_deltaker,
      etappetid: d.etappetid,
      etappe_hastighet: d.etappe_hastighet,
      persentil_totalt: d.persentil_totalt,
      persentil_klasse: d.persentil_klasse,
      plassering_totalt: d.plassering_totalt,
      plassering_klasse: d.plassering_klasse,
      deltakere_totalt: d.deltakere_totalt,
      deltakere_klasse: d.deltakere_klasse,
      loper_kjent: d.loper_kjent,
      jitter: (rng() - 0.5) * JITTER_WIDTH,
    }));
  }, [varConfig, filterData]);

  const [hovered, setHovered] = useState(null);

  const xDomain = useMemo(() => {
    if (varConfig.domain !== 'auto') return varConfig.domain;
    const extent = d3.extent(points, (d) => d.x);
    const padding = (extent[1] - extent[0]) * 0.05;
    return [extent[0] - padding, extent[1] + padding];
  }, [varConfig, points]);

  const boundsHeight = activeEtapper.length * BAND_HEIGHT;
  const chartHeight = boundsHeight + MARGIN.top + MARGIN.bottom;

  const xScale = useMemo(
    () => d3.scaleLinear().domain(xDomain).range([0, boundsWidth]).nice(),
    [xDomain]
  );

  const yScale = useMemo(
    () => d3.scaleBand().domain(activeEtapper).range([0, boundsHeight]).padding(0.3),
    [activeEtapper, boundsHeight]
  );

  return (
    <div className="app-layout">
      <Sidebar filters={filters} onFiltersChange={handleToggle} onSelectAll={handleSelectAll} onClearAll={handleClearAll} />

      <div>
        <text style={{ alignContent: "left" }}>
          <h1>Hvor fort har Riksrevisjonen løpt i Holmenkollstafetten siden 2017?</h1>
        </text>

        <div style={{ marginBottom: 10, textAlign: 'center' }}>
          <label htmlFor="xvar-select" style={{ marginRight: 8 }}>Hva vil du sammenligne? </label>
          <select id="xvar-select" value={xVar} onChange={(e) => setXVar(e.target.value)}>
            {Object.entries(X_VARIABLES).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <svg width={WIDTH} height={chartHeight}>
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* X axis top */}
              <g>
                <AxisTop
                  xScale={xScale}
                  pixelsPerTick={180}
                  tickFormat={varConfig.tickFormat}
                  label={varConfig.label}
                />
                <g transform="translate(0,-60)">
                  <text x={0} textAnchor="start" fontSize={16} fill="#666">
                    ← Raskere løp
                  </text>
                  <text x={boundsWidth} textAnchor="end" fontSize={16} fill="#666">
                    Tregere løp →
                  </text>
                </g>
              </g>

              {/* Band backgrounds */}
              {activeEtapper.map((etappe) => (
                <rect
                  key={`bg-${etappe}`}
                  x={0}
                  y={yScale(etappe)}
                  width={boundsWidth}
                  height={yScale.bandwidth()}
                  fill="#f7f7f7"
                />
              ))}

              {/* X axis */}
              <g transform={`translate(0,${boundsHeight})`}>
                <AxisBottom
                  xScale={xScale}
                  pixelsPerTick={180}
                  tickFormat={varConfig.tickFormat}
                  label={varConfig.label}
                  boundsHeight={boundsHeight}
                />
                <g transform="translate(0,60)">
                  <text x={0} textAnchor="start" fontSize={16} fill="#666">
                    ← Raskere løp
                  </text>
                  <text x={boundsWidth} textAnchor="end" fontSize={16} fill="#666">
                    Tregere løp →
                  </text>
                </g>
              </g>

              {/* Y axis labels */}
              {activeEtapper.map((etappe) => (
                <text
                  key={etappe}
                  x={-10}
                  y={yScale(etappe) + yScale.bandwidth() / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={14}
                  fill="currentColor"
                >
                  {etappe}
                </text>
              ))}

              {/* Data points */}
              {points.map((d, i) => (
                <circle
                  key={i}
                  cx={xScale(d.x)}
                  cy={yScale(d.y) + yScale.bandwidth() / 2 + d.jitter}
                  r={6}
                  stroke='#40665d'
                  fill="#69b3a2"
                  opacity={0.7}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </g>
          </svg>

          <Tooltip hovered={hovered} xScale={xScale} yScale={yScale} MARGIN={MARGIN} />
        </div>
      </div>
    </div>
  );
}

export default App
