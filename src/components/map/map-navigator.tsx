import { useState } from "react";
import { Box, Flex, Input, IconButton, Field as ChakraField } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

// Returns [lng, lat] if the value is "lat, lng" (comma required), otherwise null.
// Auto-swaps if values appear reversed; rejects out-of-range values.
function parseCoords(value: string): [number, number] | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  let lat = parseFloat(match[1]);
  let lng = parseFloat(match[2]);
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) [lat, lng] = [lng, lat];
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lng, lat];
}

interface MapNavigatorProps {
  onSelectCluster: (id: string) => void;
  onFlyTo: (lng: number, lat: number) => void;
}

const MapNavigator = ({ onSelectCluster, onFlyTo }: MapNavigatorProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    const coords = parseCoords(trimmed);
    if (coords) {
      onFlyTo(coords[0], coords[1]);
    } else {
      onSelectCluster(trimmed);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <ChakraField.Root>
        <ChakraField.Label fontSize="xs" color="fg.muted">
          Navigate to cluster, site, or coordinates
        </ChakraField.Label>
        <Flex gap={1} width="full">
          <Input
            size="sm"
            placeholder="Enter cluster ID or lat, lng…"
            flexBasis="100%"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <IconButton
            type="submit"
            size="sm"
            variant="surface"
            aria-label="Navigate to cluster or coordinates"
            disabled={!value.trim()}
          >
            <LuSearch />
          </IconButton>
        </Flex>
        <ChakraField.HelperText fontSize="xs" color="fg.subtle">
          Coordinates must be in <em>lat, lng</em> format
        </ChakraField.HelperText>
      </ChakraField.Root>
    </Box>
  );
};

export default MapNavigator;
