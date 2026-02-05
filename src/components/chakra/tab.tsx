import { Tabs, Center } from "@chakra-ui/react";
import { type TabItem } from '@/app/types/ui';

interface TabProps {
  items: TabItem[];
}

const Tab = ({ items }: TabProps) => {
  return (
    <Tabs.Root
      defaultValue={items[0].id}
      fitted
      variant="line"
    >
      <Tabs.List>
        {items.map(item => <Tabs.Trigger
          _selected={{
            bg: "panelBg"
          }}
          key={item.id} value={item.id}>{item.label}</Tabs.Trigger>)}
        <Tabs.Indicator />
      </Tabs.List>
      {items.map(item => <Tabs.Content key={item.id} value={item.id}><item.Component /></Tabs.Content>)}
    </Tabs.Root>
  );
};

export { Tab };
