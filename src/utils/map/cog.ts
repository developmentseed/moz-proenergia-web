import { fromUrl } from 'geotiff';
import { MEDIA_URL_PREFIX } from '@/utils/api';

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
