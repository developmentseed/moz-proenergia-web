import { useState, useEffect } from 'react';
import  { Map, Popup, Source, Layer } from 'react-map-gl/maplibre'
import { Box } from '@chakra-ui/react'
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import FPSControl from './fps-control';
import { additionalSources, additionalLayers, modelLayers, modelSource, filters } from '@/config/map';
import type { SidebarFormState } from '@/types/sidebar';
import { useRemoteData } from '@/hooks/use-remote-data'
import { usePopup } from'./use-popup';
const COORDS = [-25.9692, 32.5732]

interface MapVisualizationProps {
  state: SidebarFormState;
}

export default function MapVisualization({ state }: MapVisualizationProps) {

  const { layers: visibleLayers, rangeFilters } = state;
  const { hoverInfo, setHoverInfo, onHover,  } = usePopup();
  const [firstIdle, setFirstIdle] = useState(false)
  const [debugPerformanceMeasure, setDebugPerforamnceMeasure] = useState(performance.now())

  // Mocking some types of remote data
  const { data: remoteData } = useRemoteData('/filter.csv');
  const { data: remoteVizData } = useRemoteData('/popup.csv');
  const range = rangeFilters['range-filter-2'];

  const [matched, setMatched] = useState<(string | number | boolean | string[])[]>([
        "match",
        ["get", "fid"],
        "true"
      ]);
  const [firstFillExpression, setFirstFillExpression] = useState<(string | number | boolean | string[])[]>([
        "match",
        ["get", "fid"],
        "", "#ccc",
        "#ccc"
      ]);
  // @ts-expect-error ingore for now
  const matching = {...remoteData.find(f => f.fid == hoverInfo?.fid), ...remoteVizData.find(f => f.fid == hoverInfo?.fid)};
  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    setDebugPerforamnceMeasure(performance.now())
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
    return () => {
      maplibregl.removeProtocol('pmtiles')
    }
  },[])

  useEffect(() => {

    if (!remoteVizData.length) return;
    const colorWorker = new Worker(new URL('./color-worker.ts', import.meta.url));
    
    colorWorker.onmessage = (e) => {
      const matchExpression = ['match', ['get', 'fid'],
          ...e.data,
          '#ccc'
        ]
      setFirstFillExpression(matchExpression);
    };
    
    colorWorker.postMessage({ remoteData: remoteVizData });
    return () => colorWorker.terminate();
  }, [remoteVizData]);

  useEffect(() => {
    const worker = new Worker(new URL('./filter-worker.ts', import.meta.url));
    
    worker.onmessage = (e) => {
      const matchExpression = [
        "match",
        ["get", "fid"],
        ...e.data,
        true
      ];
      setMatched(matchExpression);
    };
    
    worker.postMessage({ remoteData, range });
    return () => worker.terminate();
  }, [remoteData, range]);

  return (<Box w='100%' className="map-container">
          <Box position={'absolute'} top={8} right={2} zIndex={150000} p={2} background={'white'}> time that took until first idle state: {!firstIdle && <span>Loading</span>} {firstIdle && <span> {debugPerformanceMeasure} </span>}</Box>
        <Map
          initialViewState={{
            longitude: COORDS[1],
            latitude: COORDS[0],
            zoom: 6
          }}
          style={{ width: '100%', height: '100vh' }}
          onClick={onHover}
          onIdle={() => {
            if (!firstIdle) {
              setDebugPerforamnceMeasure(prev => performance.now() - prev);
              setFirstIdle(true);
            }
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          interactiveLayerIds={['model-fill', 'model-line']}
        >
          <FPSControl position="top-right" />

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
                    ...matchingPaintStyle,
                    "fill-color": firstFillExpression
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
        {hoverInfo?.fid && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setHoverInfo(null)}
          >
            {`fid: ${hoverInfo.fid} | Population: ${hoverInfo.population} | Distance to MV line: ${matching && matching['CurrentMVLineDist']} | LCOE 2027: ${matching && matching['MinimumOverallLCOE2027']}`} 
          </Popup>
        )}
        </Map>
      </Box>)
}