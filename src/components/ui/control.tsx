import { Tab } from "@/components/chakra";
import { type SliderValueChangeDetails, Box, Collapsible, Text } from "@chakra-ui/react";
import { LuChevronUp, LuLayers, LuFilter } from "react-icons/lu";
import { FilterControl } from './filters/filter-control';
import { LayerControl } from './layers/layer-control';
import { useModel } from "@/utils/context/model";
import { ChangeEvent } from "react";
import { ApplyActions } from './apply-actions';
import { FilterType, type Filter } from "@/app/types";

interface ColGroup {
  title: string;
  items: Filter[];
}

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

const CollapsibleGroup = ({ collapsibleItem }: { collapsibleItem: ColGroup }) => {
  const { displayFilters, setPendingFilters } = useModel();
  return <Collapsible.Root defaultOpen>
    <Collapsible.Trigger
      display="flex"
      gap="2"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      textStyle="collapsibleGroupTitle"
    >
      {collapsibleItem.title}
      <Collapsible.Indicator
        transition="transform 0.2s"
        _open={{ transform: "rotate(180deg)" }}
      >
        <LuChevronUp />
      </Collapsible.Indicator>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <Box mt={1}>
        {collapsibleItem.items?.map(matchingFilter => {
        const setFilterOnChange = (e: unknown) =>{
          if (matchingFilter.type === FilterType.admin) setPendingFilters({ [matchingFilter.id]: (e as ChangeEvent<HTMLSelectElement>).target.value });
          else if (matchingFilter.type === FilterType.checkbox) setPendingFilters({ [matchingFilter.id]: e as string[] });
          else {
            setPendingFilters({ [matchingFilter.id]: (e as SliderValueChangeDetails).value });
          }
        };
        const currentFilter = displayFilters[matchingFilter.id];
        return <FilterControl key={matchingFilter.id} config={matchingFilter} value={currentFilter} onChange={setFilterOnChange} />;
        })
      }
      </Box>
    </Collapsible.Content>
  </Collapsible.Root>;
};

const ControlsPanel = () => {
  const { model, displayFilters, setPendingFilters } = useModel();
  if (!displayFilters) return <div>Please wait</div>;

  const adminFilterExists = model.filters.filter(f => f.type === FilterType.admin);
  const adminFilter = !!adminFilterExists.length? [{
    title: 'Area Selection',
    items: model.filters.filter(f => f.type === FilterType.admin)
  }]: [];

  const checkboxExists = model.filters.filter(f => f.type===FilterType.checkbox);
  const checkboxFilters = !!checkboxExists.length? checkboxExists.map(item => ({ title: item.label, items: [item] })): [];

  // Group area selection related filter together here.
  const collapsibleGroups: ColGroup[] = [...adminFilter, ...checkboxFilters].filter(i => i);
  const noCollapsibleGroups = model.filters.filter(f=>f.type === FilterType.numeric);

  return <Box position="relative" p={4}>
    {/* put collapsible groups first */}
    {collapsibleGroups.map(group => <Box key={group.title} mb={6}><CollapsibleGroup collapsibleItem={group} /></Box>)}

    {/* numeric data doesn't need to be collapsible */}
    {noCollapsibleGroups.map(matchingFilter => {
      const setFilterOnChange = (e: unknown) => {
        setPendingFilters({ [matchingFilter.id]: (e as SliderValueChangeDetails).value });
      };
      const currentFilter = displayFilters[matchingFilter.id];
      return <Box key={matchingFilter.id} mb={6}><FilterControl config={matchingFilter} value={currentFilter} onChange={setFilterOnChange} /></Box>;
    })}

    {/* Button */}
    <ApplyActions />
  </Box>;
};

const tabItems = [{
  id: 'controls',
  label: <><LuFilter /><Text textStyle='subTitle'>Controls</Text></>,
  Component: ControlsPanel
}, {
  id: 'layers',
  label: <><LuLayers /><Text textStyle='subTitle'>Layers</Text></>,
  Component: LayersPanel
}];

const Control = () => {
  return <Tab items={tabItems} />;
};

export { Control };