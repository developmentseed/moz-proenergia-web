"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Label, Pie, PieChart, Sector, Tooltip } from "recharts";
import { type SummaryItem } from "@/app/types/summary";
import { formatDisplayNumber } from "@/utils/number";

// @TODO: consolidate fallback colors to chart config
const DEFAULT_COLORS = [
  "blue.solid",
  "orange.solid",
  "pink.solid",
  "green.solid",
  "purple.solid",
  "cyan.solid",
  "yellow.solid",
  "red.solid",
  "teal.solid",
  "gray.solid",
];

interface SummaryDonutChartProps {
  data: SummaryItem[];
  colorMap?: Record<string, string>;
  unit?: string;
}

export const SummaryDonutChart = ({ data, colorMap, unit }: SummaryDonutChartProps) => {
  const chart = useChart({
    data: data.map((item, idx) => ({
      name: item.label,
      value: typeof item.value === "number" ? item.value : 0,
      color: colorMap?.[item.key] ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    })),
  });

  return (
    <Chart.Root maxH="16rem" chart={chart}>
      <PieChart>
        <Tooltip
          cursor={false}
          animationDuration={100}
          formatter={(value) => formatDisplayNumber(value as number) + (unit ? ` ${unit}` : "")}
          content={<Chart.Tooltip hideLabel />}
        />
        <Pie
          data={chart.data}
          dataKey={chart.key("value")}
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="80%"
          isAnimationActive={false}
          label={({ value }) => formatDisplayNumber(value)}
          shape={(props) => (
            <Sector
              {...props}
              strokeWidth={2}
              fill={chart.color(props.payload!.color)}
            />
          )}
        />
        <Label
          content={({ viewBox }) => (
            <Chart.RadialText
              viewBox={viewBox}
              fontSize="14px"
              // title={formatDisplayNumber(chart.getTotal("value"))}
              description={unit ? ` ${unit}` : ""}
              />
            )}
          />
      </PieChart>
    </Chart.Root>
  );
};
