### COG Generation tips

Proenergia front-end app uses [MaplibreGL COG Protocol](https://github.com/geomatico/maplibre-cog-protocol) for COG rendering. This plug-in requires specific configuration for rendering and better performance. COG should be in EPSG:3857, and use the Google Maps tiling scheme with 256x256 block size.

The example GDAL command below was used to generate a working COG.

#### Single band data 

```
docker run --rm -v .:/srv ghcr.io/osgeo/gdal:alpine-small-3.9.1 gdalwarp /srv/${source}.tif /srv/${dest}.tif -of COG -t_srs EPSG:3857 -co BLOCKSIZE=256 -co TILING_SCHEME=GoogleMapsCompatible
```
When not using Docker

```
gdalwarp /srv/${source}.tif /srv/${dest}.tif -of COG -t_srs EPSG:3857 -co BLOCKSIZE=256 -co TILING_SCHEME=GoogleMapsCompatible
```

#### RGB data (Satellite imagery)

```
docker run --rm -v .:/srv ghcr.io/osgeo/gdal:alpine-small-3.9.1 gdalwarp /srv/<source>.tif /srv/<target>.tif -of COG -t_srs EPSG:3857 -co BLOCKSIZE=256 -co TILING_SCHEME=GoogleMapsCompatible -co COMPRESS=JPEG -co OVERVIEWS=IGNORE_EXISTING -co ADD_ALPHA=NO -dstnodata NaN
```
When not using docker 
```
gdalwarp /srv/<source>.tif /srv/<target>.tif -of COG -t_srs EPSG:3857 -co BLOCKSIZE=256 -co TILING_SCHEME=GoogleMapsCompatible -co COMPRESS=JPEG -co OVERVIEWS=IGNORE_EXISTING -co ADD_ALPHA=NO -dstnodata NaN
```

Read more from MaplibreGL COG Protocol repo: [https://github.com/geomatico/maplibre-cog-protocol?tab=readme-ov-file#cog-generation-tips](https://github.com/geomatico/maplibre-cog-protocol?tab=readme-ov-file#cog-generation-tips)