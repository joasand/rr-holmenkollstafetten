const TICK_LENGTH = 6;

export const AxisBottom = ({ xScale, pixelsPerTick, label, tickFormat, boundsHeight }) => {
  const range = xScale.range();
  const width = range[1] - range[0];
  const numberOfTicksTarget = Math.floor(width / pixelsPerTick);
  const format = tickFormat || ((v) => v);

  return (
    <>
      <line
        x1={range[0]} y1={0} x2={range[1]} y2={0}
        stroke="currentColor" fill="none"
      />
      {xScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(${xScale(value)}, 0)`}>
          {/* Grid line */}
          {boundsHeight && (
            <line y1={0} y2={-boundsHeight} stroke="#b3b3b3" />
          )}
          <line y2={TICK_LENGTH} stroke="currentColor" />
          <text
            style={{
              fontSize: "15px",
              textAnchor: "middle",
              transform: "translateY(20px)",
            }}
          >
            {format(value)}
          </text>
        </g>
      ))}

      {/* Axis title */}
      {label && (
        <text
          y={45}
          x={width / 2}
          fontSize={22}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </>
  );
};