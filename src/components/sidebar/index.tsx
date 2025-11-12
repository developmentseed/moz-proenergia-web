
import { Stack, Separator, Heading, For, Box } from "@chakra-ui/react"
import { GroupCheckbox } from "@/components/ui/group-checkbox"
import { Checkbox } from "@/components/ui/checkbox"
import { RangeSlider } from "@/components/ui/range-slider"
import { ActionButton } from "@/components/ui/action-button"
import { layerOptionConfigs, rangeFilterConfigs, checkboxFilterConfigs } from "@/config/filters"
import type { SidebarFormState, SidebarFormActions } from '@/types/sidebar'

interface SideBarProps {
  state: SidebarFormState;
  actions: SidebarFormActions;
}

export const SideBar = ({ state, actions }: SideBarProps) => {

  return (
    <Stack>
      <Heading as='h1' size='lg'> Proenergia Prototype</Heading>
      <Box marginBottom="3">
        {/* Layers Section */}
        <Heading as='h2' size='md' marginBottom="1"> Additional Layers</Heading>
        <GroupCheckbox
          options={layerOptionConfigs}
          value={state.layers}
          onChange={actions.setLayers}
        />
      </Box>
      <Separator />
    <Box marginBottom="3">
      {/* Filters Section */}
      <Heading as='h2' size='md' marginBottom="1"> Filters</Heading>
    <Box marginBottom="2">
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
    </Box>
      <Box marginBottom="2">
        {/* Dynamic Binary Filters */}
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
      </Box>
    </Box>
    <ActionButton onClick={actions.applyFilters} />
    </Stack>
  )
}
