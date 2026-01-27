"use client";

import { useState, useEffect } from "react";
import { SimpleGrid, Box, Spinner, Center } from "@chakra-ui/react";
import { DownloadDataCard } from "@/components/chakra/card";
import { Search } from "@/components/ui/search";

interface VectorData {
  id: number;
  name: string;
  description: string;
  source: string;
  created: string;
  updated: string;
  created_by: string;
  last_updated_by: string;
  is_public: boolean;
  is_approved: boolean;
  raw_file: string;
}

export const DownloadList = () => {
  const [data, setData] = useState<VectorData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await fetch("/mock/vector/data.json");
      const json = await res.json();
      setData(json);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredData = data.filter((item) =>
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

      {filteredData.map((item) => (
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
      {filteredData.length === 0 && <Center py={10}> No data found</Center>}
    </SimpleGrid>
  );
};
