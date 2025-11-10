
import { Stack, Separator, Heading } from "@chakra-ui/react"
import { GroupCheckbox } from "@/components/ui/group-checkbox"
import { Checkbox } from "@/components/ui/checkbox"
import { RangeSlider } from "@/components/ui/range-slider"
import { ActionButton } from "@/components/ui/action-button"
import { useSidebarState } from "@/hooks/useSidebarState"

const options = [{label: 'Layer A', value: 'layer-a'},{label: 'Layer B', value: 'layer-b'}]

const binaryFilterOption={label: 'Binary option 1', value: 'binary-option-1'}

export const SideBar = () => {
  // Use the custom hook to manage all form state
  const { state, actions } = useSidebarState({
    initialLayers: [],
    initialRangeFilter1: [20, 60],
    initialRangeFilter2: [0, 100],
    initialBinaryFilter: false,
    onApply: (formState) => {
      // This callback is triggered when the action button is clicked
      console.log('Filters applied:', formState);
      // Here you can pass the state to your map component or make API calls
    }
  });

  return (
    <Stack>
      <Heading as='h1' size='lg'> Moz Proenergia prototype</Heading>
      <Separator />
      <Heading as='h2' size='md'> Layers</Heading>
      <GroupCheckbox
        options={options}
        value={state.layers}
        onChange={actions.setLayers}
      />
      <Separator />
      <Heading as='h2' size='md'> Filters</Heading>
      <Heading as='h3' size='sm'> Range Filter 1</Heading>
      <RangeSlider
        value={state.rangeFilter1}
        onChange={actions.setRangeFilter1}
        min={0}
        max={100}
      />
      <Heading as='h3' size='sm'> Range Filter 2</Heading>
      <RangeSlider
        value={state.rangeFilter2}
        onChange={actions.setRangeFilter2}
        min={0}
        max={100}
      />
      <Heading as='h3' size='sm'> Binary Filter</Heading>
      <Checkbox
        option={binaryFilterOption}
        checked={state.binaryFilter}
        onChange={actions.setBinaryFilter}
      />
      <Separator />
      <ActionButton onClick={actions.applyFilters} />
    </Stack>
  )
}
