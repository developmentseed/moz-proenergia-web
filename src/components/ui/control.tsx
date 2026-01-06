import { Tab } from "@/components/chakra";
import { type SliderValueChangeDetails, Box } from "@chakra-ui/react";
import { FilterControl } from './filters/filter-control';
import { LayerControl } from './layers/layer-control';
import { useModel } from "@/utils/context/model";
import { ChangeEvent } from "react";

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
  const { model, filters, setFilters } = useModel();

  if (!filters) return <div>Please wait</div>;
  return <Box>
    {model.filters.map(matchingFilter => {

      const setFilterOnChange = (e: unknown) =>{
        if (matchingFilter.type === 'select') setFilters({ [matchingFilter.id]: (e as ChangeEvent<HTMLSelectElement>).target.value });
        else if (matchingFilter.type === 'checkbox') setFilters({ [matchingFilter.id]: e as string[] });
        else setFilters({ [matchingFilter.id]: (e as SliderValueChangeDetails).value });
      };
      const currentFilter = filters[matchingFilter.id];
      return <FilterControl key={matchingFilter.id} config={matchingFilter} value={currentFilter} onChange={setFilterOnChange} />;
    })}

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