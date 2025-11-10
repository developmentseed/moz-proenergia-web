
import { Stack, Separator, Heading, For } from "@chakra-ui/react"
import { GroupCheckbox } from "@/components/ui/group-checkbox"
import { Checkbox } from "@/components/ui/checkbox"
import { RangeSlider } from "@/components/ui/range-slider"
import { ActionButton } from "@/components/ui/action-button"
import { useSidebarState } from "@/hooks/useSidebarState"
import { layerOptionConfigs, rangeFilterConfigs, checkboxFilterConfigs } from "@/config/filters"


export const SideBar = () => {
  // Use the custom hook with dynamic filter configuration
  const { state, actions } = useSidebarState({
    initialLayers: [],
    rangeFilters: rangeFilterConfigs,
    checkboxFilters: checkboxFilterConfigs,
    onApply: (formState) => {
      // This callback is triggered when the action button is clicked
      console.log('Filters applied:', formState);
      // Here you can pass the state to your map component or make API calls
    }
  });

  return (
    <Stack>
      <Heading as='h1' size='lg'> Proenergia Prototype</Heading>

      {/* Layers Section */}
      <Heading as='h2' size='md'> Layers</Heading>
      <GroupCheckbox
        options={layerOptionConfigs}
        value={state.layers}
        onChange={actions.setLayers}
      />
      <Separator />

      {/* Filters Section */}
      <Heading as='h2' size='md'> Filters</Heading>

      {/* Dynamic Range Filters */}
      <For each={rangeFilterConfigs}>
        {(filterConfig) => (
          <div key={filterConfig.id}>
            <Heading as='h3' size='sm'>{filterConfig.label}</Heading>
            <RangeSlider
              value={state.rangeFilters[filterConfig.id]}
              onChangeEnd={(value) => actions.setRangeFilter(filterConfig.id, value)}
              min={filterConfig.min}
              max={filterConfig.max}
              step={filterConfig.step}
              minStepsBetweenThumbs={filterConfig.minStepsBetweenThumbs}
            />
          </div>
        )}
      </For>

      {/* Dynamic Checkbox Filters */}
      <For each={checkboxFilterConfigs}>
        {(filterConfig) => (
          <Checkbox
            key={filterConfig.id}
            option={{ label: filterConfig.label, value: filterConfig.id }}
            checked={state.checkboxFilters[filterConfig.id]}
            onChange={(value) => actions.setCheckboxFilter(filterConfig.id, value)}
          />
        )}
      </For>

      <Separator />
      <ActionButton onClick={actions.applyFilters} />
    </Stack>
  )
}
