"use client";

import { type ChangeEvent } from "react";
import { Text, Box, Heading, Flex } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { Select } from "@/components/chakra";
import { Control as ControlPanel } from "./control";
import { useModel } from "@/utils/context/model";
import { ModelSwitcherMenu } from "./model-switcher-menu";
import { useTranslation } from "react-i18next";

export const ControlPanelWidth = 350;
export const AnimationTime = "0.32s";

const MainPanel = ({
  isOpen,
  onToggle = () => {},
}: {
  isOpen: boolean;
  onToggle?: () => void;
}) => {
  const { model, scenarioId, setScenarioId } = useModel();
  const { t } = useTranslation();

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setScenarioId(e.target.value);
  };

  const scenarioItems = model.scenarios.map((s) => ({
    id: s.id,
    label: t(`scenario.${s.id}.name`, { defaultValue: s.label }),
    description: s.description ? t(`scenario.${s.id}.description`, { defaultValue: s.description }) : undefined,
  }));

  return (
    <Box
      position="relative"
      bg="panelBg"
      overflow={{ base: "visible", md: "hidden" }}
      width={{ base: "100%", md: isOpen ? ControlPanelWidth : 0 }}
      height={{ base: "44px", md: "auto" }}
      borderRightWidth={{ base: 0, md: isOpen ? "1px" : 0 }}
      borderRightStyle="solid"
      borderRightColor="panelBorder"
      transition={{ base: "none", md: `width ${AnimationTime} ease` }}
    >
      {/* Mobile: handle bar */}
      <Box
        display={{ base: "block", md: "none" }}
        borderBottom="1px solid"
        borderColor="panelBorder"
      >
        <Flex h="44px" px={4} align="center" gap={2}>
          <ModelSwitcherMenu />

          {/* Chevron — only this opens/closes the drawer */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w={7}
            h={7}
            cursor="pointer"
            rounded="sm"
            flexShrink={0}
            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
            transition="transform 0.2s"
            onClick={onToggle}
            _hover={{ bg: "gray.100" }}
          >
            <LuChevronDown />
          </Box>
        </Flex>

      </Box>

      {/* Mobile: expandable drawer (absolute, slides down over the map) */}
      <Box
        display={{ base: "block", md: "none" }}
        position="absolute"
        top="44px"
        left={0}
        right={0}
        zIndex={500}
        overflow="hidden"
        maxHeight={isOpen ? "80dvh" : "42px"}
        transition={`max-height ${AnimationTime} ease`}
        bg="panelBg"
        borderBottom="1px solid"
        borderColor="panelBorder"
        boxShadow="md"
      >
        <Box overflowY="auto" maxH="80dvh" display="flex" flexDirection="column">
          <Box p={4} display={isOpen ? "block" : "none"}>
            <Select
              title="Scenario"
              items={scenarioItems}
              value={scenarioId}
              onChange={onChange}
              props={{}}
            />
          </Box>
          <ControlPanel onTabClick={!isOpen ? onToggle : undefined} />
        </Box>
      </Box>

      {/* Desktop: existing left panel layout */}
      <Box
        display={{ base: "none", md: "flex" }}
        width={ControlPanelWidth}
        flexDirection="column"
        height="100%"
      >
        <Box p={4}>
          <Text textStyle="subTitle">{t('explorer.model')}</Text>
          <Heading as="h2" textStyle="modelTitle">
            {t(`model.${model.id}.name`, { defaultValue: model.title })}
          </Heading>
          <Select
            title={t('explorer.scenario')}
            items={scenarioItems}
            value={scenarioId}
            onChange={onChange}
            props={{}}
          />
        </Box>
        <ControlPanel />
      </Box>
    </Box>
  );
};

export default MainPanel;
