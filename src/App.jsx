import { useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import './App.css'
import { RaceData } from './data-import';
import { AxisBottom } from './AxisBottom';
import { AxisTop } from './AxisTop';
import { Sidebar, useFilters, useHighlights } from './Sidebar';
import { Tooltip } from './Tooltip';
import { MARGIN, WIDTH, BAND_HEIGHT, boundsWidth, X_VARIABLES, parseTime } from './chartConfig';
import RelayData from './relay-data.json';

const yVar = 'etappe';

const relayInfo = new Map(RelayData.map(d => [d.etappe, d]));

function App() {
  const [xVar, setXVar] = useState('persentil_totalt');
  const varConfig = X_VARIABLES[xVar];

  const { filters, handleToggle, handleSelectAll, handleClearAll, filterData, activeEtapper,
    selectedYears, selectedTeams, selectedEtapper, selectedLoperKjent } = useFilters();

  const { highlights, handleHighlightToggle, deltaker, handleDeltakerToggle, isHighlighted } = useHighlights();

  const points = useMemo(() => {
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
    }));
  }, [varConfig, filterData]);

  const [hovered, setHovered] = useState(null);
  const [xRange, setXRange] = useState(null);

  const dataExtent = useMemo(() => {
    if (varConfig.domain !== 'auto') return varConfig.domain;
    const extent = d3.extent(points, (d) => d.x);
    if (xVar === 'etappetid') {
      const minRecord = Math.min(...activeEtapper.map(e => {
        const info = relayInfo.get(e);
        return info ? parseTime(info.etappe_rekord) : Infinity;
      }));
      if (isFinite(minRecord)) extent[0] = Math.min(extent[0], minRecord);
    }
    return extent;
  }, [varConfig, points, xVar, activeEtapper]);

  const fullExtent = useMemo(() => {
    const padding = (dataExtent[1] - dataExtent[0]) * 0.03;
    return [dataExtent[0] - padding, dataExtent[1] + padding];
  }, [dataExtent]);

  // Reset slider when variable changes
  useEffect(() => setXRange(null), [xVar]);

  const xDomain = xRange ? (() => {
    const padding = (xRange[1] - xRange[0]) * 0.03;
    return [xRange[0] - padding, xRange[1] + padding];
  })() : fullExtent;

  const visiblePoints = useMemo(() => {
    if (!xRange) return points;
    return points.filter(d => d.x >= xRange[0] && d.x <= xRange[1]);
  }, [points, xRange]);

  const boundsHeight = activeEtapper.length * BAND_HEIGHT;
  const chartHeight = boundsHeight + MARGIN.top + MARGIN.bottom;

  const xScale = useMemo(
    () => d3.scaleLinear().domain(xDomain).range([0, boundsWidth]),
    [xDomain]
  );

  const yScale = useMemo(
    () => d3.scaleBand().domain(activeEtapper).range([0, boundsHeight]).padding(0.3),
    [activeEtapper, boundsHeight]
  );

  // Beeswarm dodge: compute y-offsets so dots don't overlap
  const DOT_RADIUS = 6;
  const dodgeOffsets = useMemo(() => {
    const offsets = new Map();
    const diameter = DOT_RADIUS * 2;
    // Group visible points by band
    const groups = new Map();
    visiblePoints.forEach(d => {
      if (!groups.has(d.y)) groups.set(d.y, []);
      groups.get(d.y).push(d);
    });
    groups.forEach((band) => {
      // Sort by x pixel position for efficient collision detection
      band.sort((a, b) => xScale(a.x) - xScale(b.x));
      const placed = []; // {px, offset}
      band.forEach(d => {
        const px = xScale(d.x);
        let offset = 0;
        let step = 1;
        // Try center first, then alternate above/below
        while (true) {
          const collides = placed.some(p => {
            const dx = px - p.px;
            const dy = offset - p.offset;
            return Math.sqrt(dx * dx + dy * dy) < diameter;
          });
          if (!collides) break;
          // Alternate: +1, -1, +2, -2, ...
          offset = Math.ceil(step / 2) * diameter * (step % 2 === 1 ? -1 : 1);
          step++;
        }
        placed.push({ px, offset });
        const key = `${d.year}-${d.team}-${d.y}-${d.deltaker}`;
        offsets.set(key, offset);
      });
    });
    return offsets;
  }, [visiblePoints, xScale]);

  return (
    <div className="app-layout">
      <Sidebar filters={filters} onFiltersChange={handleToggle} onSelectAll={handleSelectAll} onClearAll={handleClearAll} filteredCount={visiblePoints.length} totalCount={RaceData.length}
        highlights={highlights} onHighlightToggle={handleHighlightToggle}
        deltaker={deltaker} onDeltakerToggle={handleDeltakerToggle} />

      <div>
        <text style={{ alignContent: "left" }}>
          <h1>Hvem er raskest i Riksrevisjonen?</h1>
          Denne siden inneholder Riksrevisjonens resultater fra Holmenkollstafetten fra 2017 til 2025. 
          Du kan velge mellom 
          <br></br>
        </text>

        <div style={{ marginBottom: 10, textAlign: 'center' , marginTop: 30}}>
          <label htmlFor="xvar-select" style={{ marginRight: 8 }}>Hva vil du sammenligne? </label>
          <select id="xvar-select" value={xVar} onChange={(e) => setXVar(e.target.value)}>
            {Object.entries(X_VARIABLES).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        <div className="range-slider-wrapper">
          <label className="range-slider-label">Endre ytterverdier:</label>
          <div className="range-slider-container">
            <span className="range-slider-value">{varConfig.tickFormat(xRange ? xRange[0] : dataExtent[0])}</span>
            <div className="range-slider-track">
              <input
                type="range"
                min={dataExtent[0]}
                max={dataExtent[1]}
                step={(dataExtent[1] - dataExtent[0]) / 200}
                value={xRange ? xRange[0] : dataExtent[0]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  const hi = xRange ? xRange[1] : dataExtent[1];
                  setXRange([Math.min(v, hi), hi]);
                }}
              />
              <input
                type="range"
                min={dataExtent[0]}
                max={dataExtent[1]}
                step={(dataExtent[1] - dataExtent[0]) / 200}
                value={xRange ? xRange[1] : dataExtent[1]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  const lo = xRange ? xRange[0] : dataExtent[0];
                  setXRange([lo, Math.max(v, lo)]);
                }}
              />
            </div>
            <span className="range-slider-value">{varConfig.tickFormat(xRange ? xRange[1] : dataExtent[1])}</span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <svg width={WIDTH} height={chartHeight} style={{ transition: 'height 0.4s ease' }}>
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              <defs>
                <clipPath id="chart-clip">
                  <rect x={0} y={0} width={boundsWidth} height={boundsHeight} />
                </clipPath>
              </defs>

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
                  style={{ transition: 'y 0.4s ease, height 0.4s ease' }}
                />
              ))}

              {/* X axis */}
              <g transform={`translate(0,${boundsHeight})`} style={{ transition: 'transform 0.4s ease' }}>
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
              {activeEtapper.map((etappe) => {
                const info = relayInfo.get(etappe);
                return (
                  <g key={etappe} style={{ transition: 'transform 0.4s ease' }} transform={`translate(0,${yScale(etappe) + yScale.bandwidth() / 2})`}>
                    <text
                      x={-10}
                      textAnchor="end"
                      dominantBaseline="central"
                      fontSize={14}
                      fill="currentColor"
                    >
                      {etappe}
                    </text>
                    {info && (
                      <text
                        x={-10}
                        y={16}
                        textAnchor="end"
                        dominantBaseline="central"
                        fontSize={11}
                        fill="#999"
                      >
                        {info.distanse_meter} m · {info.etappe_profil}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Etappe record markers (only for etappetid) */}
              {xVar === 'etappetid' && activeEtapper.map((etappe) => {
                const info = relayInfo.get(etappe);
                if (!info) return null;
                const recordSeconds = parseTime(info.etappe_rekord);
                const cx = xScale(recordSeconds);
                const cy = yScale(etappe) + yScale.bandwidth() / 2;
                return (
                  <circle
                    key={`record-${etappe}`}
                    cx={cx}
                    cy={cy}
                    r={DOT_RADIUS + 1}
                    fill="#000"
                    stroke="#fff"
                    strokeWidth={1}
                    style={{ cursor: 'default', transition: 'cy 0.4s ease' }}
                    onMouseEnter={() => setHovered({ _isRecord: true, etappe, rekord: info.etappe_rekord, x: recordSeconds, y: etappe })}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}

              {/* Data points */}
              <g clipPath="url(#chart-clip)">
              {[...visiblePoints].sort((a, b) => isHighlighted(a) - isHighlighted(b)).map((d, i) => {
                const hl = isHighlighted(d);
                const key = `${d.year}-${d.team}-${d.y}-${d.deltaker}`;
                const dodge = dodgeOffsets.get(key) || 0;
                return (
                <circle
                  key={key}
                  cx={xScale(d.x)}
                  cy={yScale(d.y) + yScale.bandwidth() / 2 + dodge}
                  r={DOT_RADIUS}
                  stroke={hl ? '#A40000' : '#cccccc'}
                  fill={hl ? '#a400006b' : '#cccccc'}
                  opacity={hl ? 1 : 0.5}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer', transition: 'cy 0.4s ease, fill 0.3s ease, stroke 0.3s ease, opacity 0.3s ease' }}
                />
              )})}
              </g>
            </g>
          </svg>

          <Tooltip hovered={hovered} xScale={xScale} yScale={yScale} MARGIN={MARGIN} dodgeOffset={hovered ? (dodgeOffsets.get(`${hovered.year}-${hovered.team}-${hovered.y}-${hovered.deltaker}`) || 0) : 0} />
        </div>
      </div>
    </div>
  );
}

export default App
