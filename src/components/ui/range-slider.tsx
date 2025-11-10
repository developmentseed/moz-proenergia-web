import { Slider } from "@chakra-ui/react"

export const RangeSlider = () => {
  return (
    <Slider.Root width="100%" defaultValue={[20, 60]} minStepsBetweenThumbs={8}>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
    </Slider.Root>
  )
}
