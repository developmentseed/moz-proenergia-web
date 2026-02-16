import { Box, Flex, Text } from '@chakra-ui/react';

interface FilterLabelProps {
  title: string;
  hasPending?: boolean;
  textStyle?: string;
}

export const FilterLabel = ({ title, hasPending, textStyle = 'sliderLabel' }: FilterLabelProps) => (
  <Flex gap={1.5} align="center">
    <Text textStyle={textStyle}>{title}</Text>
    {hasPending && (
      <Box w="8px" h="8px" borderRadius="full" bg="orange.400" flexShrink={0} />
    )}
  </Flex>
);
