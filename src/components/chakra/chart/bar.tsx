"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Label } from "recharts";
import { type SummaryItem } from "@/app/types/summary";
import { formatDisplayNumber } from "@/utils/number";

interface SummaryBarChartProps {
  data: SummaryItem[];
  color?: string;
  average?: number;
  colorMap?: Record<string, string>;
  unit?: string;
}

export const SummaryBarChart = ({ data, color = "orange", average, colorMap, unit }: SummaryBarChartProps) => {
  const chart = useChart(
    colorMap
      ? {
          // Each item becomes its own series with a dedicated color (for tooltip to have a right value)
          // Data rows hold the value under the item's key.
          data: data.map((item) => ({
            label: item.label,
            [item.key]: item.value,
          })),
          series: data.map((item) => ({
            name: item.key,
            color: colorMap[item.key] ?? color,
          })),
        }
      : {
          data,
          series: [{ name: "value", color }],
        },
  );

  return (
    <Chart.Root maxH='10rem' chart={chart}>
      <BarChart data={chart.data}>
        <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey={chart.key("label")}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => formatDisplayNumber(value)}
        />
        <Tooltip
          cursor={{ fill: chart.color("bg.muted") }}
          formatter={(value) => formatDisplayNumber(value as number) + (unit ? ` ${unit}` : "")}
          content={<Chart.Tooltip />}
        />
        {average !== undefined && (
          <ReferenceLine
            y={average}
            stroke="#888"
            strokeDasharray="4 4"
            label={<Label
              value={`Avg: ${formatDisplayNumber(average)}${unit ? ` ${unit}` : ""}`}
              position="insideRight"
              fontSize={11}
              fill="#333"
            />}
          />
        )}
        {chart.series.map((item) => (
          <Bar
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            fill={chart.color(item.color)}
            stackId={colorMap ? "a" : undefined}
            barSize={Math.min(40, 200 / (data?.length || 1))}
          />
        ))}
      </BarChart>
    </Chart.Root>
  );
};
