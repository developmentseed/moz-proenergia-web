import { Slider } from "@chakra-ui/react"

interface RangeSliderProps {
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  minStepsBetweenThumbs?: number;
  step?: number;
}

export const RangeSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  minStepsBetweenThumbs = 8,
  step = 1,
}: RangeSliderProps) => {
  const handleValueChange = (details: { value: number[] }) => {
    if (onChange && details.value.length === 2) {
      onChange([details.value[0], details.value[1]]);
    }
  };

  return (
    <Slider.Root
      width="100%"
      value={value}
      onValueChange={handleValueChange}
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
    </Slider.Root>
  )
}
