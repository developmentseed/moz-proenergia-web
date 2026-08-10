"use client";

import { useState } from "react";
import { Box, ColorSwatch, HStack, Span } from "@chakra-ui/react";
import { BarSegment, useChart } from "@chakra-ui/charts";
import { type SummaryItem } from "@/app/types/summary";
import { formatDisplayNumber } from "@/utils/number";
import { zIndex } from "@/components/ui/constant";
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

  // Show tooltip dynamically
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  return (
    <Box
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setMousePos(null)}
    >
      <BarSegment.Root chart={chart}>
        <BarSegment.Content>
          <BarSegment.Bar
            tooltip={({ payload }) => {
              if (!mousePos || chart.highlightedSeries !== payload.name) return null;
              return (
                <HStack
                  pos="fixed"
                  left={`${mousePos.x + 12}px`}
                  top={`${mousePos.y + 12}px`}
                  pointerEvents="none"
                  zIndex={zIndex.toggleTip}
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
    </Box>
  );
};
