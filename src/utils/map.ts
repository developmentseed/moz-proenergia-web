const minZoom = 5;
const maxZoom = 16;

export function getModelStyle(data) {
  return {
    id: data.id,
    type: 'vector',
    url: data.tileUrl, 
    minZoom,
    maxZoom,
    layers: [
      {
        id: `${data.id}-layer-fill`,
        source: data.id,
        'source-layer': 'clusters',
        type: 'fill', 
        paint: {
          // Check if the model result is always categorical
          'fill-color': [
            "match",
            ["get", data.main.id],
            ...data.main.values.map((value:{id : string, color: string}) => `${value.id}, ${value.color}`),
            "#CCCCCC" // Default color
          ]
        }
      },
      {
        "id":  `${data.id}-layer-line`,
        "source": data.id,
        "source-layer": "clusters",
        "type": "line",
        "paint": {
          'line-color': '#aaa'
        }
      }
    ]
  }
}

function getLayerByType(layerType) {
  switch(layerType) {
    case 'point':
      return {
        "type": "circle",
        "paint": {
          'circle-color':  '#377eb8'
        }
      }
    case 'line': 
      return {
        "type": "line",
        "paint": {
          'line-color':  '#377eb8'
        }
      }
    case 'polygon':
      return {
        "type": "fill",
        "paint": {
          'fill-color': "#ffaaee"
        }
      }
    default:
      return {
        "type": "fill",
        "paint": {
          'fill-color': "#ffaaee"
        }
      }
  }
    

}
export function getContextualLayerStyle(layers) {
  return layers.map(layer => {
    return {
      id: layer.id,
      url: layer.tileUrl,
      type: 'vector',
      minZoom,
      maxZoom,
      layers: [{
        id: `${layer.id}-render`,
        source: layer.id,
        'source-layer': layer.id,
        ...getLayerByType(layer.type)
      }]
    }
  })
}

export function getMapStyle(data) {
  return {
    model: getModelStyle(data),
    ctxLayers: getContextualLayerStyle(data.layers)
  }
}