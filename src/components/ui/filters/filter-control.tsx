import { Combobox, Select, CheckboxGroup } from "@/components/chakra";
import { type Filter } from "@/app/types";
import TextRange from "./text-range";

type FilterControlProps = {
  config: Filter;
  value: string[] | [number, number] | undefined | null;
  onChange: (param:unknown) => void;
};

export function FilterControl({ config, value, onChange }: FilterControlProps) {
  switch (config.type) {
    case 'numeric':
      return (
        <TextRange
          title={config.label}
          // description={config.description}
          min={config.values[0]}
          max={config.values[1]}
          value={value as number[]}
          onChange={onChange}
        />
      );

    case 'checkbox':
      return (
        <CheckboxGroup
          title={config.label}
          label={config.label}
          // description={config.description}
          items={config.options}
          value={value as string[]}
          onChange={onChange}
        />
      );

    case 'admin':
      const items = config.options.map(s => ({ label: s, value: s }));
      return (
        <Combobox
          title={config.label}
          // description={config.description}
          items={items}
          value={value as (string[] | undefined)}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}