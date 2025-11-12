
const bucketUrl = 'https://mozsebar.s3.us-east-1.amazonaws.com/prototype/data'

export const sources = [
  {
    "id": "model",
    "type": "vector",
    "url": `pmtiles://${bucketUrl}/clusters.pmtiles`,
    minzoom: 4,
    maxzoom: 15
  },
  {
    "id": "substation",
    "type": "vector",
    "url": `pmtiles://${bucketUrl}/substation.pmtiles`,
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

export const layers = [{
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
  },
  {
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