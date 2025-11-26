const bucketUrl = 'https://mozsebar.s3.us-east-1.amazonaws.com/prototype/data'

const COLORS = ['#984ea3', "#ff7f00", "#ffff33"];

export const LEGEND = [{
  value: 'SA_PV2027',
  color: COLORS[0]
}, {
  value: 'MG_PV_Hybrid2027',
  color: COLORS[1]
}, {
  value: 'Grid2027',
  color: COLORS[2]
}, {
  value: 'N/A',
  color: "#CCCCCC"
}]

export const modelSource =   {
    "id": "model",
    "type": "vector",
    "url":`pmtiles://https://mozsebar.s3.us-east-1.amazonaws.com/prototype/data/incremental/mozambique-cols-31.pmtiles`,
    // "url": `pmtiles://${bucketUrl}/clusters.pmtiles`,
    minzoom: 5,
    maxzoom: 15
  } as const;


export const modelFillLayer = {
  "id": "model-fill",
  "source": "model",
  "source-layer": "clusters",
  "type": "fill",
  "paint": {
    'fill-color': [
        "match",
        ["get", "MinimumOverall2027"],
        "SA_PV2027", COLORS[0],
        "MG_PV_Hybrid2027", COLORS[1],
        "Grid2027", COLORS[2],
        "#CCCCCC"
      ]
  }
} as const;

export const modelPopupLayer = {
    "id": "model-popup",
    "source": "model",
    "source-layer": "clusters",
    "type": "fill",
    "paint": {
      'fill-color': '#ddd'
    }
  } as const;

export const modelLineLayer = {
  "id": "model-line",
  "source": "model",
  "source-layer": "clusters",
  "type": "line",
  "paint": {
    'line-color': '#aaa'
  }
} as const;

export const modelHighlightLayer = {
  "id": "model-highlight",
  "source": "model",
  "source-layer": "clusters",
  "type": "line",
  "paint": {
    'line-color': '#a33',
    'line-width': 2
  }
} as const;

export const modelLayers = [modelFillLayer, modelLineLayer ] as const;

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
      'circle-color':  '#377eb8'
    }
  },
  {
    "id": "transmission-network-point",
    "source": "transmission-network",
    "source-layer": "data",
    "type": "line",
    "paint": {
      'line-color': '#e41a1c'
    }
  }] as const;

export const filters = [{
  "layerId": "model-fill",
  "filterId": "population",
  "filterKey": "fill-opacity",
  "propertyName": "Population",
  "getFilterValue": (range: [number, number], propertyName: string) => {
      return [
          ['>=', ['get', propertyName], range[0]],
          ['<=', ['get', propertyName], range[1]]
      ];
    }
  }
] as const;

export const getRangeFilter = (range: [number, number], propertyName: string) => {

    // @ TODO: When the data is missing the property, just show it.
    return [
      ["any",
            ["==", ["get", propertyName], null],
            ["!", ["has", propertyName]],
            [
                "all",
                [">=", ["get", propertyName], range[0]],
                ["<", ["get", propertyName],  range[1]]
            ]
      ]]
  }