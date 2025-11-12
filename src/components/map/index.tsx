import { useEffect } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre'
import { Box } from '@chakra-ui/react'
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { sources, layers } from '@/config/map';

const COORDS = [-25.9692, 32.5732]

export default function MapVisualization() {
    // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)

    return () => {
      maplibregl.removeProtocol('pmtiles')
    }
  },[])

  return (<Box w='100%' className="map-container">
        <Map
          initialViewState={{
            longitude: COORDS[1],
            latitude: COORDS[0],
            zoom: 6
          }}
          style={{ width: '100%', height: '100vh' }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
        {sources.map(source => {
          const matchingLayers = layers.filter(l => l.source === source.id);
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