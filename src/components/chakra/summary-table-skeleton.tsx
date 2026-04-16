"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Spinner,
  Skeleton,
  SkeletonCircle,
  Separator,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const STAGE_DELAYS = [2400, 3800]; // ms after mount to advance each stage

const loadingMessages = [
  "explorer.loadingSummary",
  "explorer.loadingSummaryStage1",
  "explorer.loadingSummaryStage2",
];

export const SummaryTableSkeleton = () => {
  const { t } = useTranslation();
  const [stage, setStage] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setStage(0);
    timersRef.current = STAGE_DELAYS.map((delay, i) =>
      setTimeout(() => setStage(i + 1), delay),
    );
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <Box display="flex" flexDir="column" py={4} gap={4}>
      <Flex fontSize="sm" color="fg.muted" align="center" gap={2} animation="pulse 1.5s infinite ease-in-out">
        <Spinner size="xs" />
        <Box
          key={stage}
          animation="fadeSlideIn 1s ease both"
        >
          {t(loadingMessages[Math.min(stage, loadingMessages.length - 1)])}
        </Box>
      </Flex>

      {stage >= 1 && (
        <Box animation="fadeSlideIn 1s ease both" display="flex" flexDir="column" gap={4}>
          <Skeleton width="60%" height="16px" borderRadius="lg" variant="shine" />
          <SkeletonCircle
            size="44"
            mx="auto"
            pos="relative"
            variant="shine"
            _after={{
              content: "' '",
              position: "absolute",
              top: "25%",
              left: "25%",
              width: "50%",
              height: "50%",
              rounded: "full",
              bg: "bg",
              visibility: "visible",
            }}
          />
          <Flex direction="column" gap={2}>
            <Flex justify="space-between">
              <Skeleton width="20%" height="12px" variant="shine" />
              <Skeleton width="70%" height="12px" variant="shine" />
            </Flex>
            <Flex justify="space-between">
              <Skeleton width="25%" height="12px" variant="shine" />
              <Skeleton width="60%" height="12px" variant="shine" />
            </Flex>
            <Flex justify="space-between">
              <Skeleton width="22%" height="12px" variant="shine" />
              <Skeleton width="65%" height="12px" variant="shine" />
            </Flex>
          </Flex>
        </Box>
      )}

      {stage >= 2 && (
        <Box animation="fadeSlideIn 1s ease both" display="flex" flexDir="column" gap={4}>
          <Separator my={4} />
          <Skeleton width="70%" height="16px" borderRadius="lg" variant="shine" />
          <Flex gap={4} alignItems="end">
            <Skeleton flex="1" height="40px" variant="shine" />
            <Skeleton flex="1" height="60px" variant="shine" />
            <Skeleton flex="1" height="45px" variant="shine" />
            <Skeleton flex="1" height="80px" variant="shine" />
            <Skeleton flex="1" height="120px" variant="shine" />
          </Flex>
          <Flex direction="column" gap={2}>
            <Flex justify="space-between">
              <Skeleton width="22%" height="12px" variant="shine" />
              <Skeleton width="65%" height="12px" variant="shine" />
            </Flex>
            <Flex justify="space-between">
              <Skeleton width="25%" height="12px" variant="shine" />
              <Skeleton width="60%" height="12px" variant="shine" />
            </Flex>
            <Flex justify="space-between">
              <Skeleton width="20%" height="12px" variant="shine" />
              <Skeleton width="70%" height="12px" variant="shine" />
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  );
};
