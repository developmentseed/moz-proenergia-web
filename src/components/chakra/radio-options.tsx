import { Group, RadioCard } from "@chakra-ui/react";
import { type FormEventHandler } from "react";
import { type ItemUnit } from "@/app/types";

interface RadioOptionsProps {
  title: string;
  items: ItemUnit[];
  onChange: FormEventHandler<HTMLDivElement>
  value: string;
}

const RadioOptions = ({ title, items, onChange, value }: RadioOptionsProps) => {
  return (
    <RadioCard.Root defaultValue={items[0].value} gap="4" maxW="sm" onChange={onChange} value={value}>
      <RadioCard.Label>{title}</RadioCard.Label>
      <Group attached orientation="vertical">
        {items.map((item) => (
          <RadioCard.Item key={item.value} value={item.value} width="full">
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl>
              <RadioCard.ItemIndicator />
              <RadioCard.ItemContent>
                <RadioCard.ItemText>{item.label}</RadioCard.ItemText>
                <RadioCard.ItemDescription>
                  {item.description}
                </RadioCard.ItemDescription>
              </RadioCard.ItemContent>
            </RadioCard.ItemControl>
          </RadioCard.Item>
        ))}
      </Group>
    </RadioCard.Root>
  );
};

export { RadioOptions };