"use client";

import { ColorSwatch, HStack, Span } from "@chakra-ui/react";
import { BarSegment, useChart } from "@chakra-ui/charts";
import { type SummaryItem } from "@/app/types/summary";
import { formatDisplayNumber } from "@/utils/number";
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
        <BarSegment.Bar
          tooltip={({ payload }) => {
            if (chart.highlightedSeries !== payload.name) return null;
            return (
              <HStack
                pos="absolute"
                top="-4"
                right="4"
                bg="bg.panel"
                textStyle="xs"
                px="2.5"
                py="1"
                gap="1.5"
                rounded="l2"
                shadow="md"
              >
                <ColorSwatch value={chart.color(payload.color)} boxSize="0.82em" rounded="full" />
                <Span>{payload.name}</Span>
                <Span fontFamily="mono" fontWeight="medium">
                  {formatDisplayNumber(payload.value)}{unit ? ` ${unit}` : ""}
                </Span>
              </HStack>
            );
          }}
        />
      </BarSegment.Content>
      <BarSegment.Legend
        showPercent
        gap="1"
        textStyle="xs"
      />
    </BarSegment.Root>
  );
};
