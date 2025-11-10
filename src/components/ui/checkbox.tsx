import { Checkbox as ChakraCheckbox } from "@chakra-ui/react"

type CheckboxOption = {
  label: string;
  value: string;
}
export const Checkbox = ({option}: {option: CheckboxOption}) => {
  return (              <ChakraCheckbox.Root key={option.value} value={option.value}>
                  <ChakraCheckbox.HiddenInput />
                  <ChakraCheckbox.Control />
                  <ChakraCheckbox.Label>{option.label}</ChakraCheckbox.Label>
                </ChakraCheckbox.Root>)
}