import { useState, useEffect } from "react"
import { Slider } from "@chakra-ui/react"

const RangeSlider = ({title, items, value, onChange}) => {
  const [localValue, setLocalValue] = useState(value)

  // useEffect(() => {
  //   setLocalValue(value)
  // }, [value])

  return (
    <Slider.Root
      width="full"
      defaultValue={items}
      value={localValue}
      onValueChange={(details) => setLocalValue(details.value)}
      onValueChangeEnd={(details) => {
        setLocalValue(details.value)
        onChange(details)
      }}
    >
      <Slider.Label>Slider - {title}</Slider.Label>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
    </Slider.Root>
  )
}

export { RangeSlider }