import { Box, Flex, Text } from '@chakra-ui/react';

interface FilterLabelProps {
  title: string;
  hasPending?: boolean;
  pendingCount?: number;
  textStyle?: string;
}

export const FilterLabel = ({ title, hasPending, pendingCount, textStyle = 'sliderLabel' }: FilterLabelProps) => (
  <Flex gap={1.5} align="center">
    <Text textStyle={textStyle}>{title}</Text>
    {hasPending && (
      pendingCount && pendingCount > 1 ? (
        <Flex
          w="16px" h="16px"
          borderRadius="full"
          bg="yellow.400"
          flexShrink={0}
          align="center"
          justify="center"
          fontSize="10px"
          fontWeight="bold"
          lineHeight="1"
        >
          {pendingCount}
        </Flex>
      ) : (
        <Box w="8px" h="8px" borderRadius="full" bg="yellow.400" flexShrink={0} />
      )
    )}
  </Flex>
);
