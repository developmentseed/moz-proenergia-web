import { memo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const label = config.labelKey ? t(config.labelKey, { defaultValue: config.label }) : config.label;
  const description = config.descriptionKey ? t(config.descriptionKey, { defaultValue: config.description }) : config.description;

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