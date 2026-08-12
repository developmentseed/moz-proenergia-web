"use client";

import { Box, ColorSwatch, HStack, Span, Text } from "@chakra-ui/react";
import { BarSegment, useChart } from "@chakra-ui/charts";
import { Tooltip } from "@/components/ui/tooltip";
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
      <HStack pos="relative" gap="0.5" w="full">
        {chart.data.map((item) => (
          <Tooltip
            key={item.name}
            positioning={{ placement: "top" }}
            openDelay={0}
            closeDelay={0}
            contentProps={{
              bg: "bg.panel",
              color: "fg",
              px: "2.5",
              py: "1",
              rounded: "l2",
              boxShadow: "md",
              textStyle: "xs",
            }}
            content={
              <HStack gap="1.5" _icon={{ boxSize: "2.5" }}>
                <ColorSwatch rounded="full" boxSize="2" value={chart.color(item.color)} />
                <HStack justify="space-between" flex="1">
                  <Span color="fg.muted">{item.name}</Span>
                  <Text fontFamily="mono" fontWeight="medium" fontVariantNumeric="tabular-nums">
                    {formatDisplayNumber(item.value)}{unit ? ` ${unit}` : ""}
                  </Text>
                </HStack>
              </HStack>
            }
          >
            <Box
              flexShrink="0"
              flex="var(--bar-percent)"
              height="var(--bar-size)"
              bg={item.color}
              rounded="l1"
              style={{ ["--bar-percent" as string]: `${chart.getValuePercent("value", item.value)}%` }}
            />
          </Tooltip>
        ))}
      </HStack>
      <BarSegment.Legend
        showPercent
        gap="1"
        textStyle="xs"
      />
    </BarSegment.Root>
  );
};
