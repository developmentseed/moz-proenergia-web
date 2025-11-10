import { Checkbox as ChakraCheckbox } from "@chakra-ui/react"

type CheckboxOption = {
  label: string;
  value: string;
}

interface CheckboxProps {
  option: CheckboxOption;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = ({ option, checked, onChange }: CheckboxProps) => {
  const handleCheckedChange = (details) => {
    if (onChange) {
      onChange(details.checked);
    }
  };

  return (
    <ChakraCheckbox.Root
      value={option.value}
      checked={checked}
      onCheckedChange={handleCheckedChange}
    >
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control />
      <ChakraCheckbox.Label>{option.label}</ChakraCheckbox.Label>
    </ChakraCheckbox.Root>
  )
}