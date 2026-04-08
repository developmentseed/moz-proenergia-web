'use client';

import { Box, Heading, Text, Button, Image, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { LuInfo, LuMap } from "react-icons/lu";

export default function Home() {
  const { t } = useTranslation();

  return (
    <Box h="calc(100vh - 57px)" display="flex">
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        bg="gray.50"
        px={{ base: 4, md: 8 }}
        py={8}
      >
        <VStack gap={6} maxW="4xl" align="start">
          <Heading as="h1" size={{base: "3xl", md: "4xl"}} textTransform="uppercase" fontWeight="900" lineHeight="1" letterSpacing="0.8px">
            <span style={{ fontWeight: "300" }}>{t('home.countryName')}</span> <br />
            {t('home.title')}
          </Heading>
          <Text fontSize="lg" color="gray.600">
            {t('home.description')}
          </Text>
          <Box
            pt={4}
            display="flex"
            gap={4}
            flexDirection={{ base: "column", sm: "row" }}
            width="full"
          >
            <Button asChild size="lg" variant="outline">
              <NextLink href="/about"><LuInfo size={20} /> {t('home.learnMore')}</NextLink>
            </Button>
            <Button asChild size="lg" variant="solid" colorPalette="orange">
              <NextLink href="/models"><LuMap size={20} /> {t('home.viewModels')}</NextLink>
            </Button>
          </Box>
        </VStack>
      </Box>
      <Box
        flex={1}
        position="relative"
        display={{ base: "none", md: "block" }}
        bg="gray.200"
      >
        <Image
          src="/landing-image1.png"
          alt={t('home.imageAlt')}
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
        />
      </Box>
    </Box>
  );
}
