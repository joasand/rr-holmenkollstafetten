import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import './App.css'
import { RaceData } from './data-import';
import { AxisBottom } from './AxisBottom';
import styles from './tooltip.module.css';

const MARGIN = { top: 20, right: 30, bottom: 70, left: 150 };
const JITTER_WIDTH = 30;
const WIDTH = 1100;
const HEIGHT = 900;
const boundsWidth = WIDTH - MARGIN.left - MARGIN.right;
const boundsHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

const xVar = 'persentil_totalt';
const yVar = 'etappe';
const sortVar = 'etappe_nr';

function App() {

  const etapper = useMemo(() => {
    return [...new Map(RaceData.map(d => [d[yVar], d[sortVar]])).entries()]
      .sort((a, b) => Number(a[1]) - Number(b[1]))
      .map(([name]) => name);
  }, []);

  const points = useMemo(() => {
    const rng = d3.randomLcg(42);
    return RaceData.map((d) => ({
      x: d[xVar],
      y: d[yVar],
      year: d.year,
      deltaker: d.etappe_deltaker,
      etappetid: d.etappetid,
      etappe_hastighet: d.etappe_hastighet,
      persentil_totalt: d.persentil_totalt,
      persentil_klasse: d.persentil_klasse,
      jitter: (rng() - 0.5) * JITTER_WIDTH,
    }));
  }, []);

  const [hovered, setHovered] = useState(null);

  const xScale = useMemo(
    () => d3.scaleLinear().domain([0, 100]).range([0, boundsWidth]),
    []
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(etapper)
        .range([0, boundsHeight])
        .padding(0.3),
    [etapper]
  );

  return (
    <svg width={WIDTH} height={HEIGHT}>
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>

        {/* Band backgrounds */}
        {etapper.map((etappe) => (
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
            tickFormat={(v) => `${v}%`}
            label="Test"
            boundsHeight={boundsHeight}
          />

          {/* Annotations */}
          <g transform="translate(0,60)">
            <text x={0} textAnchor="start" fontSize={13} fill="#666">
              ← Raskere løp
            </text>
            <text x={boundsWidth} textAnchor="end" fontSize={13} fill="#666">
              Tregere løp →
            </text>
          </g>
        </g>

        {/* Y axis labels */}
        {etapper.map((etappe) => (
          <text
            key={etappe}
            x={-10}
            y={yScale(etappe) + yScale.bandwidth() / 2}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={13}
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

      {/* Tooltip */}
      {hovered && (
        <foreignObject
          x={xScale(hovered.x) + MARGIN.left + 10}
          y={yScale(hovered.y) + yScale.bandwidth() / 2 + hovered.jitter + MARGIN.top}
          width={220}
          height={200}
          style={{ overflow: 'visible' }}
        >
          <div className={styles.tooltip}>
            <div className={styles.title}>{hovered.deltaker}</div>
            <div className={styles.separator} />
            <div className={styles.row}><span>År</span><span>{hovered.year}</span></div>
            <div className={styles.row}><span>Etappetid</span><span>{hovered.etappetid}</span></div>
            <div className={styles.row}><span>Hastighet</span><span>{hovered.etappe_hastighet}</span></div>
            <div className={styles.row}><span>Persentil (totalt)</span><span>{hovered.persentil_totalt.toFixed(1)} %</span></div>
            <div className={styles.row}><span>Persentil (klasse)</span><span>{hovered.persentil_klasse.toFixed(1)} %</span></div>
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

export default App
