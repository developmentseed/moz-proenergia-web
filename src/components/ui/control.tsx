import { Tab } from "@/components/chakra";
import { type SliderValueChangeDetails, Box, Collapsible } from "@chakra-ui/react";
import { LuChevronUp } from "react-icons/lu";
import { FilterControl } from './filters/filter-control';
import { LayerControl } from './layers/layer-control';
import { useModel } from "@/utils/context/model";
import { ChangeEvent } from "react";
import { ApplyActions } from './apply-actions';
import { type Filter } from "@/app/types";

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
      paddingY="3"
      display="flex"
      gap="2"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
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
      <Box>
        {collapsibleItem.items?.map(matchingFilter => {
        const setFilterOnChange = (e: unknown) =>{
          if (matchingFilter.type === 'select') setPendingFilters({ [matchingFilter.id]: (e as ChangeEvent<HTMLSelectElement>).target.value });
          else if (matchingFilter.type === 'checkbox') setPendingFilters({ [matchingFilter.id]: e as string[] });
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

  const adminFilterExists = model.filters.filter(f => f.type ==='admin');
  const adminFilter = !!adminFilterExists.length? [{
    title: 'Area Selection',
    items: model.filters.filter(f => f.type ==='admin')
  }]: [];

  const checkboxExists = model.filters.filter(f => f.type==='checkbox');
  const checkboxFilters = !!checkboxExists.length? checkboxExists.map(item => ({ title: item.label, items: [item] })): [];

  // Group area selection related filter together here.
  const collapsibleGroups: ColGroup[] = [...adminFilter, ...checkboxFilters].filter(i => i);

  const noCollapsibleGroups = model.filters.filter(f=>f.type ==='numeric');

  return <Box position="relative" height="100%" p={4}>
    {collapsibleGroups.map(group => <CollapsibleGroup key={group.title} collapsibleItem={group} />)}

    {/* numeric data doesn't need to be collapsible */}
    {noCollapsibleGroups.map(matchingFilter => {
      const setFilterOnChange = (e: unknown) => {
        setPendingFilters({ [matchingFilter.id]: (e as SliderValueChangeDetails).value });
      };
      const currentFilter = displayFilters[matchingFilter.id];
      return <FilterControl key={matchingFilter.id} config={matchingFilter} value={currentFilter} onChange={setFilterOnChange} />;
    })}
    {/* Button */}
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