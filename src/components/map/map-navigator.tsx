import { useState } from "react";
import { Box, Flex, Input, IconButton, Field as ChakraField } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

const COORD_PATTERN = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;

// Shape check only — returns true if the value looks like "lat, lng". Does NOT
// validate that the values are within coordinate ranges.
function isCoords(value: string): boolean {
  return COORD_PATTERN.test(value.trim());
}

// Parses a coord-shaped string into [lng, lat]. Returns null if either value
// is out of range. Callers should pre-check with isCoords() to distinguish
// "not coordinates" from "invalid coordinates".
function parseCoords(value: string): [number, number] | null {
  const match = value.trim().match(COORD_PATTERN);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lng, lat];
}

interface MapNavigatorProps {
  onSelectCluster: (id: string) => void;
  onFlyTo: (lng: number, lat: number) => void;
}

const MapNavigator = ({ onSelectCluster, onFlyTo }: MapNavigatorProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    // if not coordinate pattern, find cluster
    if (!isCoords(trimmed)) {
      setError(null);
      onSelectCluster(trimmed);
      return;
    }
    const coords = parseCoords(trimmed);
    if (!coords) {
      setError("Coordinates out of range. Latitude must be between -90 and 90, longitude between -180 and 180.");
      return;
    }
    setError(null);
    onFlyTo(coords[0], coords[1]);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <ChakraField.Root invalid={!!error}>
        <ChakraField.Label fontSize="xs" color="fg.muted">
          Navigate to cluster, site, or coordinates
        </ChakraField.Label>
        <Flex gap={1} width="full">
          <Input
            size="sm"
            placeholder="Enter cluster ID or lat, lng…"
            flexBasis="100%"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
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
        {error ? (
          <ChakraField.ErrorText fontSize="xs">{error}</ChakraField.ErrorText>
        ) : (
          <ChakraField.HelperText fontSize="xs" color="fg.subtle">
            Coordinates must be in <em>lat, lng</em> format
          </ChakraField.HelperText>
        )}
      </ChakraField.Root>
    </Box>
  );
};

export default MapNavigator;
