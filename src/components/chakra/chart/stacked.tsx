"use client";

import { BarSegment, useChart } from "@chakra-ui/charts";
import { type SummaryItem } from "@/app/types/summary";
import { DEFAULT_COLORS } from './config';

interface SummaryStackedBarChartProps {
  data: SummaryItem[];
  colorMap?: Record<string, string>;
  unit?: string;
}

export const SummaryStackedBarChart = ({ data, colorMap, unit }: SummaryStackedBarChartProps) => {
  const chart = useChart({
    data: data.map((item, idx) => ({
      name: item.label,
      value: typeof item.value === "number" ? item.value : 0,
      color: colorMap?.[item.key] ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    })),
  });

  return (
    <BarSegment.Root chart={chart}>
      <BarSegment.Content>
        <BarSegment.Bar tooltip />
      </BarSegment.Content>
      <BarSegment.Legend
        showPercent
        gap="1"
        textStyle="xs"
      />
    </BarSegment.Root>
  );
};
