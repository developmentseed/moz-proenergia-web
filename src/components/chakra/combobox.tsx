"use client";

import { ItemUnit } from "@/app/types";
import {
  Checkbox,
  Combobox,
  Portal,
  Tag,
  useFilter,
  useListCollection
} from "@chakra-ui/react";
import { zIndex } from "@/components/ui/constant";
import { useTranslation } from "react-i18next";

interface ChakraComboboxProps {
  title: string;
  items: ItemUnit[];
  value: string[] | undefined;
  onChange: (param: {items: ItemUnit[], value: string[]}) => void;
}

export const ChakraCombobox = ({ title, items, value, onChange }: ChakraComboboxProps) => {
  const { contains } = useFilter({ sensitivity: "base" });
  const { t } = useTranslation();

  const { collection, filter } = useListCollection({
    initialItems: items,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.label,
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
          <Tag.Root size="sm" ml={1} position={'absolute'} top={1} p={1.5} bg={"navBg"}>
            <Tag.Label>{t('filters.selected', { count: value.length })}</Tag.Label>
          </Tag.Root>
        )}
        <Combobox.Input placeholder={value?.length ? "" : t('filters.typeToSearch')} />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content zIndex={zIndex.combobox}>
            <Combobox.Empty>{t('filters.noItemsFound')}</Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item item={item} key={item.id}>
                <Checkbox.Root checked={value?.includes(item.id)} pointerEvents="none">
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
