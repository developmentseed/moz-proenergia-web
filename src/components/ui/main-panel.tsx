"use client";

import { type ChangeEvent } from "react";
import { Text, Box, Heading } from "@chakra-ui/react";
import { Select } from "@/components/chakra";
import { Control as ControlPanel } from "./control";
import { useModel } from "@/utils/context/model";
import { useTranslation } from "react-i18next";

export const ControlPanelWidth = 350;
export const AnimationTime = "0.32s";

const MainPanel = ({ isOpen }: { isOpen: boolean }) => {
  const { model, scenarioId, setScenarioId } = useModel();
  const { t } = useTranslation();

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setScenarioId(e.target.value);
  };
  const scenarioItems = model.scenarios.map((s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
  }));

  return (
    <Box
      position="relative"
      bg="panelBg"
      borderRightWidth={isOpen ? "1px" : 0}
      borderRightStyle={"solid"}
      borderRightColor="panelBorder"
      transition={`width ${AnimationTime} ease`}
      width={isOpen ? ControlPanelWidth : 0}
    >
      <Box
        width={ControlPanelWidth}
        display="flex"
        flexDirection="column"
        height="100%"
      >
        <Box p={4}>
          <Text textStyle="subTitle">{t('explorer.model')}</Text>
          <Heading as={"h2"} textStyle="modelTitle">
            {" "}
            {model.title}{" "}
          </Heading>
          <Select
            title={t('explorer.scenario')}
            items={scenarioItems}
            value={scenarioId}
            onChange={onChange}
          />
        </Box>
        <ControlPanel />
      </Box>
    </Box>
  );
};

export default MainPanel;
