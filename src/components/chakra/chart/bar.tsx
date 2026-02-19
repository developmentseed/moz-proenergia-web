"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { type SummaryItem } from "@/app/types/summary";
import { formatDisplayNumber } from "@/utils/number";

interface SummaryBarChartProps {
  data: SummaryItem[];
  color?: string;
}

export const SummaryBarChart = ({ data, color = "orange" }: SummaryBarChartProps) => {
  const chart = useChart({
    data,
    series: [{ name: "value", color }],
  });

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
          formatter={(value) => formatDisplayNumber(value as number)}
          content={<Chart.Tooltip />}
        />
        {chart.series.map((item) => (
          <Bar
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            fill={chart.color(item.color)}
            barSize={Math.min(40, 200 / data.length)}
          />
        ))}
      </BarChart>
    </Chart.Root>
  );
};
