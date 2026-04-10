import { useMemo } from 'react';
import * as d3 from 'd3';
import './App.css'
import { data } from './data';

const MARGIN = { top: 20, right: 30, bottom: 40, left: 100 };
const JITTER_WIDTH = 20;
const WIDTH = 600;
const HEIGHT = 400;
const boundsWidth = WIDTH - MARGIN.left - MARGIN.right;
const boundsHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

const SELECTED_EMOTIONS = [
  'Enjoyment',
  'Wellrested',
  'Learned',
  'Worry',
  'Anger',
  'Sadness',
];


function App() {

  const points = useMemo(() => {
    const rng = d3.randomLcg(42);
    return data
      .filter((d) => SELECTED_EMOTIONS.includes(d.Emotion))
      .flatMap((d) =>
        Object.entries(d.values).map(([country, value]) => ({
          emotion: d.Emotion,
          country,
          value,
          jitter: (rng() - 0.5) * JITTER_WIDTH,
        }))
      );
  }, []);

  const xScale = useMemo(
    () => d3.scaleLinear().domain([0, 100]).range([0, boundsWidth]),
    []
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(SELECTED_EMOTIONS)
        .range([0, boundsHeight])
        .padding(0.3),
    []
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

        {/* X axis */}
        <g transform={`translate(0,${boundsHeight})`}>
          <line x1={0} x2={boundsWidth} y1={0} y2={0} stroke="currentColor" />
          {xTicks.map((tick) => (
            <g key={tick} transform={`translate(${xScale(tick)},0)`}>
              <line y2={6} stroke="currentColor" />
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
        {SELECTED_EMOTIONS.map((emotion) => (
          <text
            key={emotion}
            x={-10}
            y={yScale(emotion) + yScale.bandwidth() / 2}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={13}
            fill="currentColor"
          >
            {emotion}
          </text>
        ))}

        {/* Data points */}
        {points.map((d, i) => (
          <circle
            key={i}
            cx={xScale(d.value)}
            cy={
              yScale(d.emotion) +
              yScale.bandwidth() / 2 +
              d.jitter
            }
            r={3}
            fill="#69b3a2"
            opacity={0.7}
          />
        ))}
      </g>
    </svg>
  );
}

export default App
