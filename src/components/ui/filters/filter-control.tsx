import { RangeSlider, RadioOptions, Select } from "@/components/chakra"

type FilterControlProps = {
  config: Filter;
  value: any;
  onChange: (value: any) => void;
};

export function FilterControl({ config, value, onChange }: FilterControlProps) {
  switch (config.type) {
    case 'numeric':
      return (
        <RangeSlider
          title={config.label}
          description={config.description}
          items={config.values}
          min={config.values[0]}
          max={config.values[1]}
          value={value}
          onChange={onChange}
        />
      );
    
    case 'option':
      return (
        <RadioOptions
          title={config.label}
          description={config.description}
          items={config.values}
          value={value}
          onChange={onChange}
        />
      );
    
    case 'categorical':
      return (
        <Select
          title={config.label}
          description={config.description}
          items={config.values}
          value={value}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}