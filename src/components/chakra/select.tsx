'use client';
import { type ChangeEventHandler } from "react";
import { Field, NativeSelect } from "@chakra-ui/react";
import { ItemUnit } from "@/app/types";

interface SelectProps {
  title: string;
  items: ItemUnit[];
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement >
}

const Select = ({ title, items, value, onChange }: SelectProps) => {
  return (
    <Field.Root>
      <Field.Label>{title}</Field.Label>
      <NativeSelect.Root size="sm">
        <NativeSelect.Field
          value={value}
          onChange={onChange}
      >
          {items.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Field.Root>
  );
};

export { Select };