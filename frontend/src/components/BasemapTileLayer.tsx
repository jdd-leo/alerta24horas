import { TileLayer } from 'react-leaflet';
import type { Basemap } from '../lib/basemaps';

export default function BasemapTileLayer({ basemap }: { basemap: Basemap }) {
  return (
    <>
      <TileLayer
        key={basemap.id}
        url={basemap.url}
        attribution={basemap.attribution}
        {...(basemap.subdomains ? { subdomains: basemap.subdomains } : {})}
      />
      {basemap.labelsUrl && (
        <TileLayer key={`${basemap.id}-labels`} url={basemap.labelsUrl} />
      )}
    </>
  );
}
