import { useMemo } from 'react';
import { Box } from '@chakra-ui/react';

interface GraphProps {
  years?: number[];
  data?: number[];
  width?: number;
  height?: number;
}

const defaultYears = [2027, 2030];
const defaultData = [100, 140];

const BAR_COLOR = '#377eb8';

export const Graph = ({
  years = defaultYears,
  data = defaultData,
  width = 300,
  height = 200
}: GraphProps) => {
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { bars, yTicks, xTicks } = useMemo(() => {
    const maxData = Math.max(...data);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    
    const minimumBuffer = 2; // Always give at least 2 yearas of bufer
    const yearRange = maxYear - minYear + minimumBuffer;
    const xScale = (year: number) => ((year - minYear + minimumBuffer/2)  / yearRange) * innerWidth;

    // Scale function for y values
    const yScale = (value: number) => innerHeight - (value / maxData) * innerHeight;

    const barWidth = 30;

    // Calculate bars
    const bars = data.map((value, i) => {
      const centerX = xScale(years[i]);
      const x = centerX - barWidth/2;
      const y = yScale(value);
      const height = innerHeight - y;

      return {
        x,
        y,
        width: barWidth,
        height,
        year: years[i],
        color: BAR_COLOR,
        value: value
      };
    });

    // Calculate Y axis ticks
    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const value = (maxData / (tickCount - 1)) * i;
      return {
        value: Math.round(value),
        y: yScale(value)
      };
    });

    // X axis ticks at regular intervals
    const tickInterval = yearRange > 20 ? 5 : yearRange > 10 ? 2 : 1;
    const firstTick = Math.ceil(minYear / tickInterval) * tickInterval;
    const xTicks = [];
    for (let year = firstTick; year <= maxYear; year += tickInterval) {
      xTicks.push({
        year,
        x: xScale(year)
      });
    }
    // Always include min and max years if not already included
    if (xTicks.length === 0 || xTicks[0].year > minYear) {
      xTicks.unshift({ year: minYear, x: xScale(minYear) });
    }
    if (xTicks[xTicks.length - 1].year < maxYear) {
      xTicks.push({ year: maxYear, x: xScale(maxYear) });
    }

    return { bars, yTicks, xTicks };
  }, [years, data, innerWidth, innerHeight]);

  return (
    <Box>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <line
              key={`grid-${i}`}
              x1={0}
              y1={tick.y}
              x2={innerWidth}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}

          {/* Y Axis */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={innerHeight}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          {yTicks.map((tick, i) => (
            <g key={`ytick-${i}`}>
              <line
                x1={-5}
                y1={tick.y}
                x2={0}
                y2={tick.y}
                stroke="#2d3748"
                strokeWidth={1}
              />
              <text
                x={-10}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                style={{fontSize: '12px'}}
                fill="#2d3748"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* X Axis */}
          <line
            x1={0}
            y1={innerHeight}
            x2={innerWidth}
            y2={innerHeight}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          {xTicks.map((tick, i) => (
            <g key={`xtick-${i}`}>
              <line
                x1={tick.x}
                y1={innerHeight}
                x2={tick.x}
                y2={innerHeight + 5}
                stroke="#2d3748"
                strokeWidth={1}
              />
              <text
                x={tick.x}
                y={innerHeight + 20}
                textAnchor="middle"
                style={{fontSize: '12px'}}
                fill="#2d3748"
              >
                {tick.year}
              </text>
            </g>
          ))}

          {/* Bars and labels */}
          {bars.map((bar, i) => (
            <g key={`bar-${i}`}>
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                stroke="white"
                strokeWidth={1}
                rx={2}
              />
              <text
                x={bar.x + bar.width / 2}
                y={bar.y - 5}
                textAnchor="middle"
                style={{fontSize: '10px'}}
                fill="#2d3748"
                fontWeight="semibold"
              >
                {bar.value.toLocaleString()}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </Box>
  );
};