import { Field, NativeSelect } from "@chakra-ui/react"
import { ItemUnit } from "@/app/types"

interface SelectProps {
  items: ItemUnit[]
}

const Select  = ({ title, items, onChange }: SelectProps) => {
  return (
    <Field.Root>
    <Field.Label>{title}</Field.Label>
      <NativeSelect.Root size="sm" onChange={onChange}>
      <NativeSelect.Field>
        {items.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
    </Field.Root>
  )
}

export { Select }