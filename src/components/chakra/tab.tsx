import { Tabs } from "@chakra-ui/react";
import { type TabItem } from "@/app/types/ui";

interface TabProps {
  items: TabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  onTabClick?: () => void;
}

const Tab = ({ items, value, onValueChange, onTabClick }: TabProps) => {
  const controlledProps =
    value !== undefined
      ? {
          value,
          onValueChange: ({ value: v }: { value: string }) =>
            onValueChange?.(v),
        }
      : { defaultValue: items[0].id };

  return (
    <Tabs.Root
      {...controlledProps}
      fitted
      variant="line"
      flex="1"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Tabs.List>
        {items.map((item) => (
          <Tabs.Trigger key={item.id} value={item.id} colorPalette="yellow" onClick={onTabClick}>
            {item.label}
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator />
      </Tabs.List>
      {items.map((item) => (
        <Tabs.Content overflow="hidden" flex="1" key={item.id} value={item.id}>
          <item.Component />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export { Tab };
