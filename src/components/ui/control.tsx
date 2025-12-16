
import { Tab } from "@/components/chakra"
import { Box } from "@chakra-ui/react"
import { RangeSlider, RadioOptions, Select } from "@/components/chakra"
import { ScenarioMetadata, ScenarioFilter, ScenarioLayer } from "@/app/types"

const LayersPanel = ({ layers }: { layers: ScenarioLayer[]}) => {
  return <Box>
    {layers.map(layer => <Box key={layer.id}>{layer.label} </Box>)}

  </Box>
}

const ControlsPanel = ({ filters }: { filters: ScenarioFilter[] }) => {
  return <Box>
    {filters.map(filter => {
      const MatchingComponent = filter.type === 'numeric'? RangeSlider : filter.type === 'option'? RadioOptions: Select
      return <MatchingComponent key={filter.id} title={filter.label} items={filter.values} />
    })}
  </Box>
}

const Control = ({ scenarioData }: {scenarioData: ScenarioMetadata}) => {
const tabItems = [{
  id: 'controls',
  label: 'Controls',
  Component: ControlsPanel,
  componentProps: { filters: scenarioData.filters }
}, {
  id: 'layers',
  label: 'Layers',
  Component: LayersPanel, 
  componentProps: { layers: scenarioData.layers }
}]
  return <Tab items={tabItems} />
}

export { Control }