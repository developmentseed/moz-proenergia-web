"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Box, Spinner, Center } from "@chakra-ui/react";
import { DownloadDataCard } from "@/components/chakra/card";
import { Search } from "@/components/ui/search";
import { fetchVectors } from "@/utils/data-transformation";

export const DownloadList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ['vector'],
    queryFn: () => fetchVectors()
  });

  const filteredData = data?.results.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 1, lg: 1 }} gap={2}>
      <Box mb={4}>
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search datasets..."
        />
      </Box>

      {filteredData?.map((item) => (
        <DownloadDataCard
          key={item.id}
          title={item.name}
          description={item.description}
          source={item.source}
          updated={item.updated}
          downloadUrl={item.raw_file}
          highlight={searchQuery}
        />
      ))}
      {!filteredData || filteredData.length === 0 && <Center py={10}> No data found</Center>}
    </SimpleGrid>
  );
};
