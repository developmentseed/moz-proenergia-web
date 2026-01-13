import { Tab } from "@/components/chakra";
import { type SliderValueChangeDetails, Box } from "@chakra-ui/react";
import { FilterControl } from './filters/filter-control';
import { LayerControl } from './layers/layer-control';
import { useModel } from "@/utils/context/model";
import { ChangeEvent } from "react";
import { ApplyActions } from './apply-actions';

const LayersPanel = () => {
  const { model, toggleLayer, activeLayers } = useModel();
    if (!activeLayers) return <div>Please wait</div>;

  const setLayerOnChange = (param: { [x: string]: boolean; }) =>{
    toggleLayer(param);
  };
  return <Box>
    {model.layers.map(layer => {
      const active = activeLayers.includes(layer.id);
      return <LayerControl key={layer.id} layer={layer} onChange={setLayerOnChange} selected={active} />;})
    }
  </Box>;
};

const ControlsPanel = () => {
  const { model, displayFilters, setPendingFilters } = useModel();

  if (!displayFilters) return <div>Please wait</div>;
  return <Box position="relative" height="100%">
    <Box>
      {model.filters.map(matchingFilter => {

        const setFilterOnChange = (e: unknown) =>{
          if (matchingFilter.type === 'select') setPendingFilters({ [matchingFilter.id]: (e as ChangeEvent<HTMLSelectElement>).target.value });
          else if (matchingFilter.type === 'checkbox') setPendingFilters({ [matchingFilter.id]: e as string[] });
          else setPendingFilters({ [matchingFilter.id]: (e as SliderValueChangeDetails).value });
        };
        const currentFilter = displayFilters[matchingFilter.id];
        return <FilterControl key={matchingFilter.id} config={matchingFilter} value={currentFilter} onChange={setFilterOnChange} />;
      })}
    </Box>
    <ApplyActions />
  </Box>;
};

const tabItems = [{
  id: 'controls',
  label: 'Controls',
  Component: ControlsPanel
}, {
  id: 'layers',
  label: 'Layers',
  Component: LayersPanel
}];

const Control = () => {
  return <Tab items={tabItems} />;
};

export { Control };