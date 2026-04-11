const TICK_LENGTH = 6;

export const AxisTop = ({ xScale, pixelsPerTick, label, tickFormat }) => {
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
          <line y2={-TICK_LENGTH} stroke="currentColor" />
          <text
            style={{
              fontSize: "15px",
              textAnchor: "middle",
              transform: "translateY(-10px)",
            }}
          >
            {format(value)}
          </text>
        </g>
      ))}

      {/* Axis title */}
      {label && (
        <text
          y={-30}
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
