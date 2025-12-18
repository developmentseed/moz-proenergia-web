
import { Tab } from "@/components/chakra"
import { Box } from "@chakra-ui/react"
import { Layer } from "@/app/types"
import { FilterControl } from './filters/filter-control';
import { useModel } from "@/utils/context/model";

const LayersPanel = () => {
  const { activeLayers } = useModel();
  return <Box>
    {activeLayers.map(layer => <Box key={layer}>{layer} </Box>)} 
  </Box>
}

const ControlsPanel =  () => {
  const { model, filters, setFilters } = useModel();

  if (!filters) return;
  return <Box>
    {Object.keys(filters).map(fid => {
      const matchingFilter = model.filters[fid];
      const setFilterOnChange = (e) =>{
        if (e.target) setFilters({[fid]: e.target.value})
        else setFilters({[fid]: e.value})
      }
      const currentFilter = filters[fid];
      return <FilterControl key={fid} config={matchingFilter} value={currentFilter} onChange={setFilterOnChange} />
    })}
  </Box>
}

const Control = () => {
const tabItems = [{
  id: 'controls',
  label: 'Controls',
  Component: ControlsPanel
}, {
  id: 'layers',
  label: 'Layers',
  Component: LayersPanel
}]
  return <Tab items={tabItems} />
}

export { Control }