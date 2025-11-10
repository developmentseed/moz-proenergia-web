
import { Stack, Separator, Heading } from "@chakra-ui/react"
import { GroupCheckbox } from "@/components/ui/group-checkbox"
import { Checkbox } from "@/components/ui/checkbox"
import { RangeSlider } from "@/components/ui/range-slider"
import { ActionButton } from "@/components/ui/action-button"

const options = [{label: 'Layer A', value: 'layer-a'},{label: 'Layer B', value: 'layer-b'}]

const binaryFilterOption={label: 'Binary option 1', value: 'binary-option-1'}

export const SideBar = () => {
  return (
    <Stack>
      <Heading as='h1' size='lg'> Moz Proenergia prototype</Heading>
      <Separator />
      <Heading as='h2' size='md'> Layers</Heading>
      <GroupCheckbox options={options}></GroupCheckbox>
      <Separator />
      <Heading as='h2' size='md'> Filters</Heading>
      <Heading as='h3' size='sm'> Range Filter 1</Heading>
      <RangeSlider></RangeSlider>
      <Heading as='h3' size='sm'> Range Filter 2</Heading>
      <RangeSlider></RangeSlider>
      <Heading as='h3' size='sm'> Binary Filter</Heading>
      <Checkbox option={binaryFilterOption} />
      <Separator />
      <ActionButton></ActionButton>
    </Stack>
  )
}
