
const bucketUrl = 'https://mozsebar.s3.us-east-1.amazonaws.com/prototype/data'

export const modelSource =   {
    "id": "model",
    "type": "vector",
    "url": `pmtiles://${bucketUrl}/clusters.pmtiles`,
    minzoom: 4,
    maxzoom: 15
  }
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
  }];

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
  }]

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
  }]

const filters = [{
  "layerId": "substation-point",
  "filterKey": "point-opacity",
  "getFilterValue": (on) => {
      return on? '0.0': '1.0'
    }
  }
]