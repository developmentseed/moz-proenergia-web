import { Checkbox, CheckboxGroup, Fieldset, For } from "@chakra-ui/react"

type CheckboxGroupUIProps = {
  items: Array<{ value: string; label: string }>;
  value?: string[];
  title: string;
  label: string;
  onChange?: (value: string[]) => void;
};

export const CheckboxGroupUI = ({ items, value, title, label, onChange }: CheckboxGroupUIProps) => {
  const defaultValue = items.map(item => item.value);
  return (
    <Fieldset.Root>
      <CheckboxGroup defaultValue={defaultValue} value={value} name={title} onValueChange={onChange} >
        <Fieldset.Legend fontSize="sm" mb="2">
          {label}
        </Fieldset.Legend>
        <Fieldset.Content>
          <For each={items}>
            {(option) => (
              <Checkbox.Root key={option.value} value={option.value}>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{option.label}</Checkbox.Label>
              </Checkbox.Root>
            )}
          </For>
        </Fieldset.Content>
      </CheckboxGroup>
    </Fieldset.Root>
  )
}

