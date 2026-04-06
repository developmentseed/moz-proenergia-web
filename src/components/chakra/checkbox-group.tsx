import { Checkbox, CheckboxGroup, Fieldset, For } from "@chakra-ui/react";
import { ItemUnit } from "@/app/types";
type CheckboxGroupUIProps = {
  items: ItemUnit[];
  value?: string[];
  title: string;
  label: string;
  onChange?: (value: string[]) => void;
};

export const CheckboxGroupUI = ({ items, value, title, label, onChange }: CheckboxGroupUIProps) => {
  const defaultValue = items.map(item => item.id);
  return (
    <Fieldset.Root id="fieldset">
      <CheckboxGroup defaultValue={defaultValue} value={value} name={title} onValueChange={onChange} >
        <Fieldset.Content gap={1}>
          <For each={items}>
            {(option) => (
              <Checkbox.Root key={option.id} value={option.id}>
                <Checkbox.HiddenInput />
                <Checkbox.Control width={3} height={3} />
                <Checkbox.Label textStyle='checkboxOption'>{option.label}</Checkbox.Label>
              </Checkbox.Root>
            )}
          </For>
        </Fieldset.Content>
      </CheckboxGroup>
    </Fieldset.Root>
  );
};
