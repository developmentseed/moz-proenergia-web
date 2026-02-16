import { useState, useEffect } from 'react';
import { Box, Stack, Input, Flex, Slider } from '@chakra-ui/react';
import { type SliderValueChangeDetails } from '@chakra-ui/react';
import { formatNumber } from '@/utils/numer';
import { FilterLabel } from './filter-label';

interface TextRangeProps {
  title: string;
  min: number;
  max: number;
  value: number[];
  hasPending?: boolean;
  onChange: (details: SliderValueChangeDetails) => void;
  step?: number;
}

export const TextRange = ({
  title,
  min,
  max,
  value,
  hasPending,
  onChange
}: TextRangeProps) => {
  const [localValue, setLocalValue] = useState<number[]>(value);
  const [minText, setMinText] = useState<number>(value[0] || min);
  const [maxText, setMaxText] = useState<number>(value[1] || max);
  //@TODO: better logic
  const step = 1;

  // Reset values when page navigates to new model
  useEffect(() => {
    setLocalValue(value);
    setMinText(value[0]);
    setMaxText(value[1]);
  },[value]);

  const commonPropsForTextInput = {
      min: min,
      max:max,
      step: step,
      width: "80px",
      size: "sm" as const,
      textStyle: 'sliderTextLabel',
      height: "24px",
      borderRadius: 0,
      p: 1
  };

  const handleSliderChange = (details: SliderValueChangeDetails) => {
    const newValue = details.value;
    setLocalValue(newValue);
    setMinText(newValue[0]);
    setMaxText(newValue[1]);
    onChange(details);
  };

  const handleMinTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value==='') { setMinText(0); return;}
    const noCommaValue = e.target.value.replace(',','');
    const newValue = parseInt(noCommaValue);
    if (!isNaN(newValue)) setMinText(newValue);
  };

  const handleMaxTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value==='') { setMaxText(0); return;}
    const noCommaValue = e.target.value.replace(',','');
    const newValue = parseInt(noCommaValue);
    if (!isNaN(newValue)) setMaxText(newValue);
  };

  const handleMinTextBlur = () => {
    let newMin = minText;
    // Validate and constrain the value
    if (isNaN(newMin)) {
      newMin = localValue[0];
    } else if (newMin < min || newMin > max) {
      newMin = min;
    } else {
      newMin = Math.max(min, Math.min(newMin, localValue[1]));
    }

    const newValue = [newMin, localValue[1]];
    setMinText(newMin);
    setLocalValue(newValue);
    onChange({ value: newValue });
  };

  const handleMaxTextBlur = () => {
    let newMax = maxText;

    // Validate and constrain the value
    if (isNaN(newMax)) {
      newMax = localValue[1];
    } else if (newMax > max || newMax < min) {
      newMax = max;
    } else {
      newMax = Math.min(max, Math.max(newMax, localValue[0]));
    }

    const newValue = [localValue[0], newMax];
    setMaxText(newMax);
    setLocalValue(newValue);
    onChange({ value: newValue });
  };

  const handleMinTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleMinTextBlur();
    }
  };

  const handleMaxTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleMaxTextBlur();
    }
  };

  return (
    <Stack gap={2} width="full">
      <FilterLabel title={title} hasPending={hasPending} />

      <Box width="full">
        <Slider.Root
          width="full"
          value={localValue}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      </Box>

      <Flex gap={3} align="center" justify="space-between">
        <Input
          id={`${title}-min-text`}
          value={formatNumber(minText)}
          onChange={handleMinTextChange}
          onBlur={handleMinTextBlur}
          onKeyDown={handleMinTextKeyDown}
          {...commonPropsForTextInput}
        />

        <Input
          id={`${title}-max-text`}
          value={formatNumber(maxText)}
          onChange={handleMaxTextChange}
          onBlur={handleMaxTextBlur}
          onKeyDown={handleMaxTextKeyDown}
          {...commonPropsForTextInput}
        />
      </Flex>

    </Stack>
  );
};

export default TextRange;
