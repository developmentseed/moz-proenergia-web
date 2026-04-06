"use client";

import { Box, Flex, Text, Checkbox, Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ModelGroupMetadata } from "@/app/types";

type SidebarFilterProps = {
  models: ModelGroupMetadata[] | undefined;
  selectedModelIds: string[];
  onToggle: (id: string) => void;
  onReset: () => void;
};

export const SidebarFilter = ({
  models,
  selectedModelIds,
  onToggle,
  onReset,
}: SidebarFilterProps) => {
  const { t } = useTranslation();
  const hasFilter = selectedModelIds.length > 0;

  return (
    <Box
      w={{ base: "full", md: "20rem" }}
      flexShrink={0}
      position={{ md: "sticky" }}
      top={{ md: 6 }}
      order={{ base: 0, md: 1 }}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="sm" fontWeight="semibold">
          {t("downloads.filterModels")}
        </Text>
      </Flex>
      <Flex direction="column" gap={2}>
        {models?.map((model) => (
          <Checkbox.Root
            key={model.id}
            size="sm"
            checked={selectedModelIds.includes(model.id)}
            onCheckedChange={() => onToggle(model.id)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              <Text fontSize="sm">{model.name}</Text>
            </Checkbox.Label>
          </Checkbox.Root>
        ))}
      </Flex>

      <Button
        size="xs"
        variant="ghost"
        colorPalette="orange"
        onClick={onReset}
        mt={2}
        disabled={!hasFilter}
      >
        {t("downloads.reset")}
      </Button>
    </Box>
  );
};
