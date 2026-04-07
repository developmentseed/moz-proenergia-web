import { fromUrl } from 'geotiff';
import { LayerProps } from "react-map-gl/maplibre";
import { type Layer } from '@/app/types';
import { api, MEDIA_URL_PREFIX } from '@/utils/api';
import { type ApiFileResult } from '@/utils/data-transformation';
import { registerI18nResource } from '@/utils/i18n';

const COLOR_SCHEME = 'BrewerYlGnBu9'; // This should be one of https://labs.geomatico.es/maplibre-cog-protocol/color-cheatsheet.html

export async function fetchCogMetadata(filePath: string): Promise<{ min: number; max: number; isRgb: boolean }> {
  const url = `${MEDIA_URL_PREFIX}${filePath}`;
  const tiff = await fromUrl(url);
  const imageCount = await tiff.getImageCount();
  const image = await tiff.getImage(imageCount - 1); // smallest overview
  const bandCount = image.getSamplesPerPixel();

  // RGB(A) images have 3+ bands and should be rendered as-is without colormap
  if (bandCount >= 3) {
    return { min: 0, max: 255, isRgb: true };
  }

  const rasters = await image.readRasters();
  const data = rasters[0] as Float32Array | Float64Array;
  const noData = image.getGDALNoData();

  let min = Infinity, max = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v === noData || !Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max, isRgb: false };
}

export function deriveRasterSource(id: string, filePath: string, stats?: { min: number; max: number }, isRgb?: boolean) {
  const colorFragment = !isRgb && stats
    ? `#color:${COLOR_SCHEME},${stats.min},${stats.max},c`
    : '';
  return {
    id,
    type: 'raster' as const,
    url: `cog://${MEDIA_URL_PREFIX}${filePath}${colorFragment}`,
    tileSize: 256,
  };
}

export function deriveRasterLayerStyle(sourceId: string, opacity: number = 1): LayerProps {
  return {
    id: `${sourceId}-raster-layer`,
    source: sourceId,
    type: 'raster',
    paint: { 'raster-opacity': opacity },
  };
}

export async function fetchRasters({ modelId, token, signal }: { modelId?: string, token?: string | null, signal?: AbortSignal} = {}): Promise<ApiFileResult[]> {
  try {
    const endpoint = `raster/`;
    const { data } = await api.get(endpoint, {
      signal,
      ...(token && {
        headers: { 'Authorization': `Token ${token}` }
      }),
      ...(modelId && {
        params: { 'model': modelId }
      })
    });
    const results: ApiFileResult[] = data.results;
    return results;
  } catch(e) {
    console.error(e);
    throw new Error('Failed to fetch rasters');
  }
}

// Transform rasters to layers
export function transformRastersToLayers(
  apiRasters: ApiFileResult[],
  statsMap: Map<number, { min: number; max: number; isRgb: boolean } | null>,
): Layer[] {
  return apiRasters.map(v => {
    const sourceId = String(v.id) + 'raster-source';
    const meta = statsMap.get(v.id);

    registerI18nResource(`layer.${sourceId}`, {
      label: { en: v.name, pt: v.name_pt },
      description: { en: v.description?? '', pt: v.description_pt },
    });

    return {
      id: sourceId,
      label: v.name,
      description: v.description,
      filePath: v.raw_file,
      layerType: 'raster' as const,
      rasterStats: meta ?? undefined,
      isRgb: meta?.isRgb ?? false,
    };
  });
}
