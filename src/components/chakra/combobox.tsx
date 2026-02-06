"use client";

import { ItemUnit } from "@/app/types";
import {
  Checkbox,
  Combobox,
  Portal,
  Tag,
  Text,
  useFilter,
  useListCollection
} from "@chakra-ui/react";

interface ChakraComboboxProps {
  title: string;
  items: ItemUnit[];
  value: string[] | undefined;
  onChange: (param: {items: ItemUnit[], value: string[]}) => void;
}

export const ChakraCombobox = ({ title, items, value, onChange }: ChakraComboboxProps) => {
  const { contains } = useFilter({ sensitivity: "base" });

  const { collection, filter } = useListCollection({
    initialItems: items,
    filter: contains,
  });

  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={(e) => filter(e.inputValue)}
      onValueChange={onChange}
      value={value}
      multiple
      mb={2}
      size="sm"
      fontFamily="body"
    >
      <Combobox.Label textStyle='allCapLabel'>{title}</Combobox.Label>
      <Combobox.Control>
        {value && value.length > 0 && (
          <Tag.Root size="md" ml={1} position={'absolute'} top={1} p ={2} bg={"navBg"}>
            <Tag.Label>{value.length} selected</Tag.Label>
          </Tag.Root>
        )}
        <Combobox.Input placeholder={value?.length ? "" : "Type to search"} />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No items found</Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item item={item} key={item.value}>
                <Checkbox.Root checked={value?.includes(item.value)} pointerEvents="none">
                  <Checkbox.HiddenInput />
                  <Checkbox.Control width={4} height={4} mr={1} />
                </Checkbox.Root>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};
