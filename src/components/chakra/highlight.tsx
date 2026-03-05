import { HStack, Stat } from "@chakra-ui/react";
import { type ItemUnit } from "@/app/types";

interface HighlightProps {
  items: ItemUnit[];
}

export function Highlight({ items }: HighlightProps) {
  return (
    <HStack gap={4} wrap="wrap">
      {items.map((item) => (
        <Stat.Root key={item.id} flex="1" minW="0">
          <Stat.Label fontSize='xs'>{item.label}</Stat.Label>
          <Stat.ValueText fontSize='md'>{item.id}</Stat.ValueText>
          {item.description && (
            <Stat.HelpText>{item.description}</Stat.HelpText>
          )}
        </Stat.Root>
      ))}
    </HStack>
  );
}
