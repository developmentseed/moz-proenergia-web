"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Box, Spinner, Center } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MEDIA_URL_PREFIX } from "@/utils/api";
import { useAuth } from "@/utils/context/auth";
import { DownloadDataCard } from "@/components/chakra/card";
import { Search } from "@/components/ui/search";
import { fetchVectors } from "@/utils/data-transformation";
import { fetchRasters } from "@/utils/map/cog";

export const DownloadList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['vector', token],
    queryFn: ({ signal }) => fetchVectors({ token, signal })
  });

  const { data: rasterData, isLoading: isLoadingRasters } = useQuery({
    queryKey: ['raster', token],
    queryFn: ({ signal }) => fetchRasters({ token, signal })
  });

  const allData = [...(data ?? []), ...(rasterData ?? [])];

  const filteredData = allData.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isLoadingRasters) {
    return (
      <Center py={10}>
        <Spinner colorPalette="orange" color="colorPalette.600" size="lg" />
      </Center>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 1, lg: 1 }} gap={2}>
      <Box mb={4}>
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('downloads.searchPlaceholder')}
        />
      </Box>

      {filteredData?.map((item) => (
        <DownloadDataCard
          key={item.id}
          title={item.name}
          description={item.description}
          source={item.source}
          updated={item.updated}
          downloadUrl={`${MEDIA_URL_PREFIX}${item.raw_file}`}
          highlight={searchQuery}
        />
      ))}
      {(!filteredData || filteredData.length === 0) && (
        <Center py={10}>{t('downloads.noData')}</Center>
      )}
    </SimpleGrid>
  );
};
