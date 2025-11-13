import { useState, useEffect } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre'
import { Box } from '@chakra-ui/react'
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { additionalSources, additionalLayers, modelLayers, modelSource, filters } from '@/config/map';
import type { SidebarFormState } from '@/types/sidebar';
import { useRemoteData } from '@/hooks/use-remote-data'

const COORDS = [-25.9692, 32.5732]

interface MapVisualizationProps {
  state: SidebarFormState;
}

export default function MapVisualization({ state }: MapVisualizationProps) {

  const { layers: visibleLayers, rangeFilters } = state;
  
  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)

    return () => {
      maplibregl.removeProtocol('pmtiles')
    }
  },[])

  // Mocking some types of remote data
  const { data: remoteData } = useRemoteData();
  const range = rangeFilters['range-filter-2']

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [matched, setMatched] = useState<(string | number | boolean | string[])[]>([
        "match",
        ["get", "fid"],
        "true"
      ]);
  
  useEffect(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    
    worker.onmessage = (e) => {
      const matchExpression = [
        "match",
        ["get", "fid"],
        ...e.data,
        true
      ];
      setMatched(matchExpression);
      setIsLoading(false);
    };
    
    worker.postMessage({ remoteData, range });
    setIsLoading(true);
    return () => worker.terminate();
  }, [remoteData, range]);

  return (<Box w='100%' className="map-container">
          {isLoading && <Box position={'absolute'} top={2} right={2} zIndex={150000} p={2} background={'white'}> Loading...</Box>}
        <Map
          initialViewState={{
            longitude: COORDS[1],
            latitude: COORDS[0],
            zoom: 6
          }}
          style={{ width: '100%', height: '100vh' }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          
          {/* Model Source/Layer */}
          <Source {...modelSource}>
              {modelLayers.map(layer => {
                const matchingFilter = filters.find(f => f.layerId === layer.id)!;
                if (matchingFilter) {
                const matchingRange = rangeFilters[matchingFilter.filterId];
                const matchingPaintStyle = {
                  [matchingFilter.filterKey]: matchingFilter?.getFilterValue(matchingRange, matchingFilter.propertyName)
                }
                const layerConfig = {
                  ...layer,
                  paint: { 
                    ...layer.paint,
                    ...matchingPaintStyle
                  },
                  filter: matched
                }
                 {/* @ts-expect-error leaving it temporarily */}
                return (<Layer key={layer.id} {...layerConfig} />)
                } else return <Layer key={layer.id} {...layer} />
              })
            }
          </Source>
          {additionalSources.map(source => {
            const matchingLayers = additionalLayers.filter(l => l.source === source.id).filter(l => {
              return visibleLayers.includes(l.source)
            });
            return (
              <Source key={source.id} {...source}>
                {matchingLayers.map(layer => {
                  return (<Layer key={layer.id} {...layer} />)
                })
              }</Source>
            )
          })}
        </Map>
      </Box>)
}