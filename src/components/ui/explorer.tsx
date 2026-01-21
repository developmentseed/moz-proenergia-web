'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModelProvider } from '@/utils/context/model';
import { Flex, Box, IconButton } from "@chakra-ui/react";
import { ModelMetadata } from '@/app/types';
import MainMap from '@/components/map';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { LuPanelRightOpen, LuPanelLeftOpen } from "react-icons/lu";

import MainPanel from './main-panel';

const queryClient = new QueryClient();
const ControlPanelWidth = 350;
const AnimationTime = '0.3s';

const Explorer = ({ modelData }: { modelData: ModelMetadata }) => {
    const [isOpen, setIsOpen] = useState(true);

  return (
    <ModelProvider model={modelData}>
      <QueryClientProvider client={queryClient}>
        <Flex id='container' width="full" height='full' position="relative">
          <MainPanel isOpen={isOpen} />
          {/* Toggle Button Tab */}
          <Box
            position="absolute"
            left={isOpen ? ControlPanelWidth : 0}
            top="8"
            transform="translateY(-50%)"
            zIndex={1000}
            transition={`left ${AnimationTime} ease`}
          >
            <IconButton
              aria-label={isOpen ? "Collapse panel" : "Expand panel"}
              onClick={() => setIsOpen(!isOpen)}
              variant="solid"
              size="sm"
              // _hover={{ bg: "gray.200" }}
              borderRadius={0}
            >
              {isOpen ? <LuPanelRightOpen /> : <LuPanelLeftOpen />}
            </IconButton>
          </Box>

          <Box transition={`width ${AnimationTime} ease`} height='full' width='full'><MainMap main={modelData.main} /></Box>
        </Flex>
      </QueryClientProvider>
    </ModelProvider>
  );
};

export default Explorer;