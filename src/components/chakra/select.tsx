"use client";
import { type ChangeEventHandler } from "react";
import { BoxProps, Field, NativeSelect } from "@chakra-ui/react";
import { ItemUnit } from "@/app/types";

interface SelectProps {
  title: string;
  items: ItemUnit[];
  value: string;
  multi?: boolean;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  props: BoxProps
}

const Select = (
  { title, items, value, multi, onChange, props }: SelectProps,
) => {
  return (
    <Field.Root fontFamily="body" {...props}>
      <Field.Label fontSize="xs" textStyle="allCapLabel">
        {title}
      </Field.Label>
      <NativeSelect.Root size="sm">
        <NativeSelect.Field value={value} onChange={onChange}>
          {items.map((item) => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Field.Root>
  );
};

export { Select };
