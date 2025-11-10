import Map, { Source, Layer } from 'react-map-gl/maplibre'
import { Box } from '@chakra-ui/react'
import 'maplibre-gl/dist/maplibre-gl.css';


const COORDS = [-25.9692, 32.5732]

export default function MapVisualization() {
return (<Box w='100%' className="map-container">
        <Map
          initialViewState={{
            longitude: COORDS[1],
            latitude: COORDS[0],
            zoom: 6
          }}
          style={{ width: '100%', height: '100vh' }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          // onLoad={initializeTerraDrawOnLoad}
        >
          
            <Source
              id="population-tiles"
              type="raster"
              tiles={[]}
              tileSize={256}
              maxzoom={18}
            >
              <Layer
                id="population-layer"
                type="raster"
                paint={{
                  'raster-opacity': 0.8
                }}
              />
            </Source>
          
          
          {/* {useGeotiff && (
            <GeoTiffViewer
              cogUrl={cogUrl}

            />
          )} */}
        </Map>
      </Box>)
}