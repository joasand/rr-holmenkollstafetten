import { useMemo } from 'react';
import * as d3 from 'd3';
import './App.css'
import { RaceData } from './data-import';

const MARGIN = { top: 20, right: 30, bottom: 40, left: 150 };
const JITTER_WIDTH = 20;
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
      jitter: (rng() - 0.5) * JITTER_WIDTH,
    }));
  }, []);

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

  const xTicks = xScale.ticks(5);

  return (
    <svg width={WIDTH} height={HEIGHT}>
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        {/* Grid lines */}
        {xTicks.map((tick) => (
          <line
            key={tick}
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1={0}
            y2={boundsHeight}
            stroke="#e0e0e0"
          />
        ))}

        {/* Band backgrounds */}
        {etapper.map((etappe) => (
          <rect
            key={`bg-${etappe}`}
            x={0}
            y={yScale(etappe)}
            width={boundsWidth}
            height={yScale.bandwidth()}
            fill="#f0f0f0"
          />
        ))}

        {/* X axis */}
        <g transform={`translate(0,${boundsHeight})`}>
          <line x1={0} x2={boundsWidth} y1={0} y2={0} stroke="currentColor" />
          {xTicks.map((tick) => (
            <g key={tick} transform={`translate(${xScale(tick)},0)`}>
              <line y1={0} y2={-boundsHeight} stroke="#666666" />
              <text
                y={20}
                textAnchor="middle"
                fontSize={12}
                fill="currentColor"
              >
                {tick}%
              </text>
            </g>
          ))}
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
          />
        ))}
      </g>
    </svg>
  );
}

export default App
