import { memo } from "react";
import { useLocalize } from "@/utils/i18n";
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
  const localize = useLocalize();
  const label = localize(config.label, config.label_pt);
  const description = config.description ? localize(config.description, config.description_pt) : undefined;

  switch (config.type) {
    case 'numeric':
      return (
        <TextRange
          title={label}
          hasPending={hasPending}
          description={description}
          min={config.options[0]}
          max={config.options[1]}
          value={value as number[]}
          onChange={onChange}
        />
      );

    case 'checkbox':
      return (
        <CheckboxGroup
          title={label}
          label={label}
          items={config.options}
          value={value as string[]}
          onChange={onChange}
        />
      );

    case 'admin':
      const items = config.options.map(s => ({ label: s, id: s }));
      return (
        <Combobox
          title={label}
          items={items}
          value={value as (string[] | undefined)}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
});