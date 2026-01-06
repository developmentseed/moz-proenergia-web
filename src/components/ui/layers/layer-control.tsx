import ToggleSwitch from "@/components/chakra/switch";
import { type Layer } from "@/app/types";

interface LayerControlProops {
layer: Layer;
onChange: (param: { [x: string]: boolean; }) => void;
selected: boolean;
}

export const LayerControl = ({ layer, onChange, selected }: LayerControlProops) => {
  return <ToggleSwitch label={layer.label} value={layer.id} onChange={onChange} selected={selected} />;
};