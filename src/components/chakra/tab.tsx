import { Tabs } from "@chakra-ui/react";
import { type TabItem } from "@/app/types/ui";

interface TabProps {
  items: TabItem[];
}

const Tab = ({ items }: TabProps) => {
  return (
    <Tabs.Root
      defaultValue={items[0].id}
      fitted
      variant="line"
      flex="1"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Tabs.List>
        {items.map((item) => (
          <Tabs.Trigger key={item.id} value={item.id} colorPalette="orange">
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
