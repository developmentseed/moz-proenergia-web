### COG Generation tips

Proenergia front-end app uses MaplibreGL COG Proptocol for COG rendering. This plug-in requires specific configuration for rendering and better performance. 

The example GDAL command below was used to generate a working COG.(Docker was used but it is not necessary)

```
docker run --rm -v .:/srv ghcr.io/osgeo/gdal:alpine-small-3.9.1 gdalwarp /srv/${source}.tif /srv/${dest}.tif -of COG -t_srs EPSG:3857 -co BLOCKSIZE=256 -co TILING_SCHEME=GoogleMapsCompatible
```
When not using Docker

```
gdalwarp /srv/${source}.tif /srv/${dest}.tif -of COG -t_srs EPSG:3857 -co BLOCKSIZE=256 -co TILING_SCHEME=GoogleMapsCompatible
```

Read more from MaplibreGL COG Protocol repo: [https://github.com/geomatico/maplibre-cog-protocol?tab=readme-ov-file#cog-generation-tips](https://github.com/geomatico/maplibre-cog-protocol?tab=readme-ov-file#cog-generation-tips)

