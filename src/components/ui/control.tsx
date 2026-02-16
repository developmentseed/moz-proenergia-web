import { memo, useCallback } from "react";
import { Tab } from "@/components/chakra";
import {
  type SliderValueChangeDetails,
  Box,
  Collapsible,
  ScrollArea,
  Text,
} from "@chakra-ui/react";
import { LuChevronUp, LuLayers, LuSettings2 } from "react-icons/lu";
import { FilterControl } from "./filters/filter-control";
import { FilterLabel } from "./filters/filter-label";
import { LayerControl } from "./layers/layer-control";
import { useModel } from "@/utils/context/model";
import { useContextualLayers } from "@/utils/context/contextual-layers";
import { useFilters } from "@/utils/context/filters";
import { ApplyActions } from "./apply-actions";
// FilterType as enum
import { FilterType, type Filter, type ItemUnit } from "@/app/types";

interface ColGroup {
  title: string;
  items: Filter[];
}

// Wrapper component to memoize onChange per filter
const FilterControlWrapper = memo(function FilterControlWrapper({
  filter,
  value,
  hasPending,
  setPendingFilters,
}: {
  filter: Filter;
  value: string[] | [number, number] | undefined | null;
  hasPending?: boolean;
  setPendingFilters: (updates: Record<string, unknown>) => void;
}) {
  const onChange = useCallback(
    (e: unknown) => {
      if (filter.type === FilterType.admin) {
        setPendingFilters({
          [filter.id]: (e as { items: ItemUnit[]; value: string[] }).value,
        });
      } else if (filter.type === FilterType.checkbox) {
        setPendingFilters({ [filter.id]: e as string[] });
      } else {
        setPendingFilters({
          [filter.id]: (e as SliderValueChangeDetails).value,
        });
      }
    },
    [filter.id, filter.type, setPendingFilters],
  );

  return <FilterControl config={filter} value={value} hasPending={hasPending} onChange={onChange} />;
});

const LayersPanel = () => {
  const { layers, toggleLayer, activeLayers } = useContextualLayers();
  if (!activeLayers) return <div>Please wait</div>;

  const setLayerOnChange = useCallback(
    (param: { [x: string]: boolean }) => {
      toggleLayer(param);
    },
    [toggleLayer],
  );

  return (
    <Box>
      {layers.map((layer) => {
        const active = activeLayers.includes(layer.id);
        return (
          <LayerControl
            key={layer.id}
            layer={layer}
            onChange={setLayerOnChange}
            selected={active}
          />
        );
      })}
    </Box>
  );
};

const CollapsibleGroup = memo(function CollapsibleGroup({
  collapsibleItem,
}: {
  collapsibleItem: ColGroup;
}) {
  const { displayFilters, setPendingFilters, getFilterPendingStatus } = useFilters();
  const pendingCount = collapsibleItem.items.filter((f) => getFilterPendingStatus(f.id)).length;
  console.log(collapsibleItem.items.filter((f) => getFilterPendingStatus(f.id)));
  return (
    <Collapsible.Root>
      <Collapsible.Trigger
        display="flex"
        gap="2"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        textStyle="collapsibleGroupTitle"
      >
        <FilterLabel title={collapsibleItem.title} hasPending={pendingCount > 0} pendingCount={pendingCount} textStyle="collapsibleGroupTitle" />
        <Collapsible.Indicator
          transition="transform 0.2s"
          _open={{ transform: "rotate(180deg)" }}
        >
          <LuChevronUp />
        </Collapsible.Indicator>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box mt={1}>
          {collapsibleItem.items?.map((matchingFilter) => (
            <FilterControlWrapper
              key={matchingFilter.id}
              filter={matchingFilter}
              value={displayFilters[matchingFilter.id]}
              setPendingFilters={setPendingFilters}
            />
          ))}
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
});

const ControlsPanel = () => {
  const { model } = useModel();
  const { displayFilters, setPendingFilters, getFilterPendingStatus } = useFilters();
  if (!displayFilters) return <div>Please wait</div>;

  const adminFilterExists = model.filters.filter(
    (f) => f.type === FilterType.admin,
  );
  const adminFilter = !!adminFilterExists.length
    ? [
        {
          title: "Area Selection",
          items: model.filters.filter((f) => f.type === FilterType.admin),
        },
      ]
    : [];

  const checkboxExists = model.filters.filter(
    (f) => f.type === FilterType.checkbox,
  );
  const checkboxFilters = !!checkboxExists.length
    ? checkboxExists.map((item) => ({ title: item.label, items: [item] }))
    : [];

  // Group area selection related filter together here.
  const collapsibleGroups: ColGroup[] = [
    ...adminFilter,
    ...checkboxFilters,
  ].filter((i) => i);
  const noCollapsibleGroups = model.filters.filter(
    (f) => f.type === FilterType.numeric,
  );

  return (
    // To give space for scrollable area
    <Box p={4} pr={0} h="full">
      <ScrollArea.Root h="calc(100% - 3.5rem - 1px)">
        <ScrollArea.Viewport>
          <ScrollArea.Content spaceY="4" pr={4}>
            {/* put collapsible groups first */}
            {collapsibleGroups.map((group) => (
              <Box key={group.title}>
                <CollapsibleGroup collapsibleItem={group} />
              </Box>
            ))}

            {/* numeric data doesn't need to be collapsible */}
            {noCollapsibleGroups.map((matchingFilter) => (
              <Box key={matchingFilter.id}>
                <FilterControlWrapper
                  filter={matchingFilter}
                  value={displayFilters[matchingFilter.id]}
                  hasPending={getFilterPendingStatus(matchingFilter.id)}
                  setPendingFilters={setPendingFilters}
                />
              </Box>
            ))}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
        <ScrollArea.Corner bg="bg" />
      </ScrollArea.Root>
      <Box my={4} pr={4}>
        <ApplyActions />
      </Box>
    </Box>
  );
};

const tabItems = [
  {
    id: "controls",
    label: (
      <>
        <LuSettings2 />
        <Text textStyle="subTitle">Controls</Text>
      </>
    ),
    Component: ControlsPanel,
  },
  {
    id: "layers",
    label: (
      <>
        <LuLayers />
        <Text textStyle="subTitle">Layers</Text>
      </>
    ),
    Component: LayersPanel,
  },
];

const Control = () => {
  return <Tab items={tabItems} />;
};

export { Control };
