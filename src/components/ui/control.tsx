"use client";

import { memo, useCallback } from "react";
import { Tab } from "@/components/chakra";
import {
  type SliderValueChangeDetails,
  Box,
  Accordion,
  ScrollArea,
  Text,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { LuChevronUp, LuInfo, LuLayers, LuSettings2 } from "react-icons/lu";
import { FilterControl } from "./filters/filter-control";
import { FilterLabel } from "./filters/filter-label";
import { LayerControl } from "./layers/layer-control";
import { useModel } from "@/utils/context/model";
import { useContextualLayers } from "@/utils/context/contextual-layers";
import { useFilters } from "@/utils/context/filters";
import { ApplyActions } from "./apply-actions";
// FilterType as enum
import { FilterType, type Filter, type ItemUnit } from "@/app/types";
import { Tooltip } from "./tooltip";
import { useTranslation } from "react-i18next";

interface ColGroup {
  title: string;
  description?: string;
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

  return (
    <FilterControl
      config={filter}
      value={value}
      hasPending={hasPending}
      onChange={onChange}
    />
  );
});

const LayersPanel = () => {
  const { layers, toggleLayer, activeLayers } = useContextualLayers();
  const { t } = useTranslation();

  if (!activeLayers) return <div>{t('explorer.pleaseWait')}</div>;

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
  const { displayFilters, setPendingFilters, getFilterPendingStatus } =
    useFilters();
  const pendingCount = collapsibleItem.items.filter((f) =>
    getFilterPendingStatus(f.id),
  ).length;
  return (
    <Accordion.Item value={collapsibleItem.title}>
      <Accordion.ItemTrigger
        display="flex"
        gap="2"
        alignItems="center"
        width="100%"
        textStyle="collapsibleGroupTitle"
        pb={0.5}
      >
        <FilterLabel
          title={collapsibleItem.title}
          hasPending={pendingCount > 0}
          pendingCount={pendingCount}
          textStyle="collapsibleGroupTitle"
        />
        {collapsibleItem.items[0].description && (
          <Tooltip
            content={collapsibleItem.items[0].description}
            contentProps={{ css: { "--tooltip-bg": "colors.bg", color: "fg" } }}
          >
            <IconButton as='span' variant="ghost" size="2xs" p={0}>
              <LuInfo />
            </IconButton>
          </Tooltip>
        )}
        <Accordion.ItemIndicator ml="auto">
          <LuChevronUp />
        </Accordion.ItemIndicator>
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
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
      </Accordion.ItemContent>
    </Accordion.Item>
  );
});

const ControlsPanel = () => {
  const { model } = useModel();
  const { displayFilters, setPendingFilters, getFilterPendingStatus } =
    useFilters();
  const { t } = useTranslation();

  if (!displayFilters) return <div>{t('explorer.pleaseWait')}</div>;

  const adminFilterExists = model.filters.filter(
    (f) => f.type === FilterType.admin,
  );
  const adminFilter = !!adminFilterExists.length
    ? [
        {
          title: t('explorer.areaSelection'),
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
    <Box p={4} pt={0} pr={0} h={{ base: "auto", md: "full"}}>
      <ScrollArea.Root h={{ base: "100%", md: "calc(100% - 3.5rem - 1px)" }}>
        <ScrollArea.Viewport>
          <ScrollArea.Content spaceY="4" pr={4}>
            {/* put collapsible groups first */}
            <Accordion.Root
              collapsible
              multiple
              defaultValue={["b"]}
              size="sm"
              variant="plain"
            >
              {collapsibleGroups.map((group) => (
                <CollapsibleGroup collapsibleItem={group} key={group.title} />
              ))}
            </Accordion.Root>

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

const Control = ({
  activeTab,
  onTabChange,
  onTabClick,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onTabClick?: () => void;
}) => {
  const { t } = useTranslation();

  const tabItems = [
    {
      id: "controls",
      label: (
        <>
          <LuSettings2 />
          <Text textStyle="subTitle">{t('explorer.controls')}</Text>
        </>
      ),
      Component: ControlsPanel,
    },
    {
      id: "layers",
      label: (
        <>
          <LuLayers />
          <Text textStyle="subTitle">{t('explorer.layers')}</Text>
        </>
      ),
      Component: LayersPanel,
    },
  ];
  return (
    <Tab items={tabItems} value={activeTab} onValueChange={onTabChange} onTabClick={onTabClick} />
  );
};

export { Control };
