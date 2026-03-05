import { HStack, Stat } from "@chakra-ui/react";
import { type ItemUnit } from "@/app/types";

interface HighlightProps {
  items: ItemUnit[];
}

export function Highlight({ items }: HighlightProps) {
  return (
    <HStack gap={2} wrap="wrap" align="start">
      {items.map((item) => (
        <Stat.Root key={item.id} flex="1" minW="0">
          <Stat.ValueText fontSize="lg">{item.id}</Stat.ValueText>
          <Stat.Label fontSize="xs">{item.label}</Stat.Label>
        </Stat.Root>
      ))}
    </HStack>
  );
}
