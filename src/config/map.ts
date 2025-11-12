

const bucketUrl = 'https://mozsebar.s3.us-east-1.amazonaws.com/prototype/data'

export const modelSource =   {
    "id": "model",
    "type": "vector",
    "url": `pmtiles://${bucketUrl}/clusters.pmtiles`,
    minzoom: 4,
    maxzoom: 15
  } as const;
export const modelLayers = [{
    "id": "model-fill",
    "source": "model",
    "source-layer": "data",
    "type": "fill",
    "paint": {
      'fill-color':  '#ccc'
    }
  }, {
    "id": "model-line",
    "source": "model",
    "source-layer": "data",
    "type": "line",
    "paint": {
      'line-color':  '#333'
    }
  }] as const;

export const additionalSources = [
  {
    id: "substation",
    type: "vector",
    url: `pmtiles://${bucketUrl}/substation.pmtiles`,
    minzoom: 4,
    maxzoom: 15
  },
  {
    "id": "transmission-network",
    "type": "vector",
    "url": `pmtiles://${bucketUrl}/transmission-network.pmtiles`,
    minzoom: 4,
    maxzoom: 15
  }] as const;

export const additionalLayers = [{
    "id": "substation-point",
    "source": "substation",
    "source-layer": "data",
    "type": "circle",
    "paint": {
      'circle-color':  '#33f'
    }
  },
  {
    "id": "transmission-network-point",
    "source": "transmission-network",
    "source-layer": "data",
    "type": "line",
    "paint": {
      'line-color': '#3f3'
    }
  }] as const;

export const filters = [{
  "layerId": "model-fill",
  "filterId": "range",
  "filterKey": "fill-opacity",
  "propertyName": "Population",
  "getFilterValue": (range: [number, number], propertyName: string) => {
      return [
        'case',
        [
          'all',
          ['>=', ['get', propertyName], range[0]],
          ['<=', ['get', propertyName], range[1]]
        ],
        1, // fill-opacity when property is in range
        0  // fill-opacity when property is out of range
      ];
    }
  }
] as const;