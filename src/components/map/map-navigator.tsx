import { useState } from "react";
import { Box, Flex, Input, IconButton, Field as ChakraField } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { useTranslation, Trans } from "react-i18next";

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
  const { t } = useTranslation();

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
      setError(t('map.navigateCoordsError'));
      return;
    }
    setError(null);
    onFlyTo(coords[0], coords[1]);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <ChakraField.Root invalid={!!error}>
        <ChakraField.Label fontSize="xs" color="fg.muted">
          {t('map.navigateTitle')}
        </ChakraField.Label>
        <Flex gap={1} width="full">
          <Input
            size="sm"
            placeholder={t('map.navigatePlaceholder')}
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
            aria-label={t('map.navigateAriaLabel')}
            disabled={!value.trim()}
          >
            <LuSearch />
          </IconButton>
        </Flex>
        {error ? (
          <ChakraField.ErrorText fontSize="xs">{error}</ChakraField.ErrorText>
        ) : (
          <ChakraField.HelperText fontSize="xs" color="fg.subtle">
            <Trans i18nKey="map.navigateHelperText" components={{ em: <em /> }} />
          </ChakraField.HelperText>
        )}
      </ChakraField.Root>
    </Box>
  );
};

export default MapNavigator;
