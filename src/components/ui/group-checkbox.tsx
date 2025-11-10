import { Fieldset, For, CheckboxGroup} from '@chakra-ui/react';
import { Checkbox } from "./checkbox"
import { type CheckboxOptionConfig } from '@/types/sidebar';

interface GroupCheckboxProps {
  options: CheckboxOptionConfig[];
  value?: string[];
  onChange?: (value: string[]) => void;
  name?: string;
}

export const GroupCheckbox = ({
  options,
  value,
  onChange,
  name = "layers"
}: GroupCheckboxProps) => {
  return (
    <Fieldset.Root>
      <CheckboxGroup
        value={value}
        onValueChange={onChange}
        name={name}
      >
        <Fieldset.Content>
          <For each={options}>
            {(option) => (
              <Checkbox key={option.id} option={option} />
            )}
          </For>
        </Fieldset.Content>
      </CheckboxGroup>
    </Fieldset.Root>
  )
}

