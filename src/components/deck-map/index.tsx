import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import { Box } from '@chakra-ui/react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { additionalSources, modelSource } from '@/config/map';
import type { SidebarFormState } from '@/types/sidebar';
import { MVTLoader } from "@loaders.gl/mvt";
import { parse } from "@loaders.gl/core";
import { TileLayer, type _TileLoadProps } from "@deck.gl/geo-layers";
import { GeoJsonLayer } from "@deck.gl/layers";

import * as pmtiles from "pmtiles";
import type { PMTiles } from 'pmtiles';

async function getZXY(source: PMTiles, z: number, x: number, y: number) {
  const response = await source.getZxy(z, x, y);

  if (response?.data) {
    return new Uint8Array(response.data);
  } else {
    return new Uint8Array();
  }
};

async function getTileData({ index, url }: _TileLoadProps) {
    const { x, y, z } = index;

    const source = new pmtiles.PMTiles(url as string);
    const data = await getZXY(source, z, x, y);
    return parse(data.buffer, MVTLoader, {
      loadOptions: { worker: true },
      mvt: {
        coordinates: "wgs84",
        tileIndex: {
          x,
          y,
          z
        }
      }
    });
  }

const COORDS = [-25.9692, 32.5732];

const INITIAL_VIEW_STATE = {
  longitude: COORDS[1],
  latitude: COORDS[0],
  zoom: 6,
  pitch: 0,
  bearing: 0
};

interface DeckMapVisualizationProps {
  state: SidebarFormState;
}

export default function DeckMapVisualization({ state }: DeckMapVisualizationProps) {
  const { layers: visibleLayers } = state;


    const deckLayers = [];


    deckLayers.push(
    new TileLayer({
            id: "buildings",
            data: modelSource.url.replace('pmtiles://',''),
            loadOptions: { worker: true },
            getTileData,
            tileSize: 256,
            renderSubLayers: (props) => {
              //console.log("props", props.data);
              return new GeoJsonLayer({
                ...props
              });
            }
          })
        );
      

    // Additional layers based on visibility
    additionalSources.forEach(source => {
      if (!visibleLayers.includes(source.id)) {
        return;
      }

      const sourceUrl = source.url.replace('pmtiles://', '');

      if (source.id === 'substation') {
        deckLayers.push(
          new TileLayer({
            id: 'substation-point',
            data: sourceUrl,
            getTileData,
            minZoom: source.minzoom,
            maxZoom: source.maxzoom,
            pointType: 'circle',
            getFillColor: [51, 51, 255],
            getPointRadius: 5,
            pointRadiusMinPixels: 3,
            pointRadiusMaxPixels: 10,
            pickable: true
          })
        );
      }

      if (source.id === 'transmission-network') {
        deckLayers.push(
          new TileLayer({
            id: 'transmission-network-line',
            data: sourceUrl,
            getTileData,
            minZoom: source.minzoom,
            maxZoom: source.maxzoom,
            getLineColor: [51, 255, 51],
            lineWidthMinPixels: 2,
            pickable: true
          })
        );
      }
    });


  return (
    <Box className="map-container" position={'relative'}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={deckLayers}
        style={{ width: '100%', height: '100vh' }}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          style={{ width: '100%', height: '100vh' }}
        />
      </DeckGL>
    </Box>
  );
}
