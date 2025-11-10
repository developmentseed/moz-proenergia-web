import { Slider, type SliderRootProps } from "@chakra-ui/react"
import { useState } from "react"

interface RangeSliderProps {
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  minStepsBetweenThumbs?: number;
  step?: number;
}

type OnValueChangeType = SliderRootProps['onValueChange'];
type ValueChangeDetails = Parameters<NonNullable<OnValueChangeType>>[0];

export const RangeSlider = ({
  value,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  minStepsBetweenThumbs = 8,
  step = 1,
}: RangeSliderProps) => {
  // Local state for real-time updates during interaction
  const [localValue, setLocalValue] = useState<[number, number] | undefined>(value);

  const handleValueChange = (details: ValueChangeDetails) => {
    if (details.value.length === 2) {
      const newValue: [number, number] = [details.value[0], details.value[1]];
      setLocalValue(newValue);

      // Call onChange for real-time updates (optional)
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  const handleValueChangeEnd = (details: ValueChangeDetails) => {
    if (details.value.length === 2) {
      const newValue: [number, number] = [details.value[0], details.value[1]];

      // Call onChangeEnd to update the actual filter state
      if (onChangeEnd) {
        onChangeEnd(newValue);
      }
    }
  };

  return (
    <Slider.Root
      width="100%"
      value={localValue ?? value}
      onValueChange={handleValueChange}
      onValueChangeEnd={handleValueChangeEnd}
      min={min}
      max={max}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      step={step}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
      <Slider.ValueText />
    </Slider.Root>
  )
}
