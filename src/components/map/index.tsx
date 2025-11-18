import { useEffect } from 'react';
import  { Map, Popup, Source, Layer } from 'react-map-gl/maplibre'
import { Box } from '@chakra-ui/react'
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import { type FillLayerSpecification, type FilterSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { additionalSources, additionalLayers, modelPopupLayer, modelFillLayer, modelLineLayer, modelSource, LEGEND, getRangeFilter } from '@/config/map';
import type { SidebarFormState } from '@/types/sidebar';
import { useRemoteData } from '@/hooks/use-remote-data'
import { usePopup } from'./use-popup';
import { Legend } from './legend';
import { PopupContent } from './popup';

const COORDS = [-25.9692, 32.5732]

interface MapVisualizationProps {
  state: SidebarFormState;
}



export default function MapVisualization({ state }: MapVisualizationProps) {

  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)

    return () => {
      maplibregl.removeProtocol('pmtiles')
    }
  },[])

  const { layers: visibleLayers, rangeFilters } = state;
  const { hoverInfo, setHoverInfo, onHover,  } = usePopup();

  // Mocking some types of remote data
  const { data: remoteData } = useRemoteData('/filter.csv');

  const currentFilters = Object.keys(rangeFilters).map(filterKey => {
    return getRangeFilter(rangeFilters[filterKey], filterKey)
  }).flat();
  
  const layerPropertiesWFilter = {
    ...modelFillLayer,
    filter: [
      "case",
      [
        "all",
        ...currentFilters
      ],
      true,
      false
    ]
  };

  const matchingCluster = remoteData.find(f => f.fid == hoverInfo?.data.id)
  const popupData = matchingCluster && hoverInfo? {...hoverInfo.data, ...matchingCluster} : null;

  return (<Box w='100%' className="map-container" position="relative">
          {/* {isLoading && <Box position={'absolute'} top={2} right={2} zIndex={150000} p={2} background={'white'}> Loading...</Box>} */}
        <Legend items={LEGEND} />
        <Map
          initialViewState={{
            longitude: COORDS[1],
            latitude: COORDS[0],
            zoom: 6
          }}
          style={{ width: '100%', height: '100vh' }}
          onClick={onHover}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          interactiveLayerIds={['model-popup']}
        >
          
          {/* Model Source/Layer */}
          <Source {...modelSource}>
            <Layer {...modelLineLayer} />
            <Layer {...modelPopupLayer} />
            {/* @ts-expect-error Some types are wrong with filter specification. Ignoring for now */}
            <Layer {...layerPropertiesWFilter} />

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
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setHoverInfo(null)}
          >
            <PopupContent data={popupData} />
          </Popup>
        )}
        </Map>
      </Box>)
}