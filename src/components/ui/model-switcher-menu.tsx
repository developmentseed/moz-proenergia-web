"use client";

import { Text, Box, Flex, MenuRoot, Menu, MenuTrigger, MenuContent, MenuItem } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { useModel } from "@/utils/context/model";
import { slugify } from "@/utils/data-transformation";
import { useModels } from "@/hooks/use-models";
import { getIconPath } from "@/utils/model-icon";
import { zIndex } from "@/components/ui/constant";
import { useLocalize } from "@/utils/i18n";

const ModelSwitcherMenu = () => {
  const { model } = useModel();
  const { data: models } = useModels();
  const localize = useLocalize();

  const iconPath = getIconPath(model.id);

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Flex
          align="center"
          gap={2}
          flex={1}
          minW={0}
          cursor="pointer"
          rounded="sm"
          _hover={{ bg: "gray.100" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w={7}
            h={7}
            flexShrink={0}
          >
            <Image src={iconPath} alt={localize(model.title, model.title_pt)} width={18} height={18} />
          </Box>
          <Text fontWeight="semibold" fontSize="sm" flex={1} truncate>
            {localize(model.title, model.title_pt)}
          </Text>
        </Flex>
      </MenuTrigger>
      <Menu.Positioner>
        <MenuContent zIndex={zIndex.menu}>
          {models?.map((m) => {
            const slug = slugify(m.name);
            const mIconPath = getIconPath(m.id);
            const isCurrent = String(m.id) === String(model.id);
            return (
              <MenuItem key={m.id} value={m.id} cursor="pointer" asChild>
                <NextLink href={`/model/${slug}`}>
                  <Flex align="center" gap={2}>
                    <Image src={mIconPath} alt={localize(m.name, m.name_pt)} width={16} height={16} />
                    <Text fontSize="sm" fontWeight={isCurrent ? "bold" : "normal"}>
                      {localize(m.name, m.name_pt)}
                    </Text>
                  </Flex>
                </NextLink>
              </MenuItem>
            );
          })}
        </MenuContent>
      </Menu.Positioner>
    </MenuRoot>
  );
};

export { ModelSwitcherMenu };
