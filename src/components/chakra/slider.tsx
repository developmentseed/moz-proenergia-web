import { useState, useEffect } from "react";
import { Slider, type SliderValueChangeDetails } from "@chakra-ui/react";

interface RangeSliderProps {
  title: string;
  items: number[];
  min: number;
  max: number;
  value: number[];
  onChange: (details: SliderValueChangeDetails) => void;
}

const RangeSlider = ({ title, items, min, max, value, onChange } : RangeSliderProps) => {
  const [localValue, setLocalValue] = useState<number[]>(value);

  return (
    <Slider.Root
      width="full"
      defaultValue={items}
      value={localValue}
      min={min}
      max={max}
      onValueChange={(details) => setLocalValue(details.value)}
      onValueChangeEnd={(details) => {
        setLocalValue(details.value);
        onChange(details);
      }}
    >
      <Slider.Label>{title}</Slider.Label>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
    </Slider.Root>
  );
};

export { RangeSlider };