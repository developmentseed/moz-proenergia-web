import { RangeSlider, Select, CheckboxGroup } from "@/components/chakra";
import { type Filter

 } from "@/app/types";
import TextRange from "./text-range";

type FilterControlProps = {
  config: Filter;
  value: unknown;
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

    case 'select':
      return (
        <Select
          title={config.label}
          // description={config.description}
          items={config.options}
          value={value as string}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}