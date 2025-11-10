import { Fieldset, For, CheckboxGroup} from '@chakra-ui/react';
import { Checkbox } from "./checkbox"

type CheckboxOption = {
  label: string;
  value: string;
}

export const GroupCheckbox = ({ options }: { options: CheckboxOption[] }) => {
  return (
    <Fieldset.Root>
      <CheckboxGroup defaultValue={[]} name="layers">
        <Fieldset.Content>
          <For each={options}>
            {(option) => (
              <Checkbox key={option.value} option={option} />
            )}
          </For>
        </Fieldset.Content>
      </CheckboxGroup>
    </Fieldset.Root>
  )
}

