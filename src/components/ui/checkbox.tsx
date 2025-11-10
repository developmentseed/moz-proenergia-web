import { Checkbox as ChakraCheckbox, type CheckboxRootProps } from "@chakra-ui/react"
import { type CheckboxOptionConfig } from '@/types/sidebar';
interface CheckboxProps {
  option: CheckboxOptionConfig;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

type OnCheckedChangeType = CheckboxRootProps['onCheckedChange'];
type HandleChangeEventParameter = Parameters<NonNullable<OnCheckedChangeType>>[0];

export const Checkbox = ({ option, checked, onChange }: CheckboxProps) => {

  const handleCheckedChange = (details: HandleChangeEventParameter) => {
    if (onChange) {
      onChange(!!details.checked);
    }
  };

  return (
    <ChakraCheckbox.Root
      value={option.id}
      checked={checked}
      onCheckedChange={handleCheckedChange}
    >
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control />
      <ChakraCheckbox.Label>{option.label}</ChakraCheckbox.Label>
    </ChakraCheckbox.Root>
  )
}