import { Slider } from "@chakra-ui/react"

const RangeSlider = ({title, items}) => {
  return (
    <Slider.Root width="full" defaultValue={items}>
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