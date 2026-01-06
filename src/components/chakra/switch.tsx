import { type CheckboxCheckedChangeDetails, Switch } from "@chakra-ui/react";

interface ToggleSwitchProps {
  label: string;
  value: string;
  onChange: (param: { [x: string]: boolean; }) => void;
  selected: boolean;
}

const ToggleSwitch = ({ label, value, onChange, selected }: ToggleSwitchProps) => {

  const onCheckedChange = (details: CheckboxCheckedChangeDetails) => {
    onChange({ [value]: details.checked as boolean });
  };
  return (<Switch.Root value={value} onCheckedChange={onCheckedChange} checked={selected}>
    <Switch.Label >{label}</Switch.Label >
    <Switch.HiddenInput />
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
  </Switch.Root>);
};

export default ToggleSwitch;