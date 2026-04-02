import { memo } from "react";
import { Combobox, CheckboxGroup } from "@/components/chakra";
import { type Filter } from "@/app/types";
import TextRange from "./text-range";

type FilterControlProps = {
  config: Filter;
  value: string[] | [number, number] | undefined | null;
  hasPending?: boolean;
  onChange: (param:unknown) => void;
};

export const FilterControl = memo(function FilterControl({ config, value, hasPending, onChange }: FilterControlProps) {
  switch (config.type) {
    case 'numeric':
      return (
        <TextRange
          title={config.label}
          hasPending={hasPending}
          description={config.description}
          min={config.options[0]}
          max={config.options[1]}
          value={value as number[]}
          onChange={onChange}
        />
      );

    case 'checkbox':
      return (
        <CheckboxGroup
          title={config.label}
          label={config.label}
          items={config.options}
          value={value as string[]}
          onChange={onChange}
        />
      );

    case 'admin':
      const items = config.options.map(s => ({ label: s, id: s }));
      return (
        <Combobox
          title={config.label}
          items={items}
          value={value as (string[] | undefined)}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
});