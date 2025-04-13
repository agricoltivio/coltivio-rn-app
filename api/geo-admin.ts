interface GeoAdminLocationSearchResponse {
  results: Result[];
}

interface Result {
  attrs: Attrs;
  id: number;
  weight: number;
}

interface Attrs {
  detail: string;
  featureId: string;
  geom_quadindex: string;
  geom_st_box2d: string;
  label: string;
  lat: number;
  lon: number;
  num: number;
  objectclass: string;
  origin: string;
  rank: number;
  x: number;
  y: number;
  zoomlevel: number;
}
export type LocationSearchResult = {
  label: string;
  weight: number;
  lat: number;
  lon: number;
};
export async function searchAddressLocation(
  query: string
): Promise<LocationSearchResult[]> {
  const response = await fetch(
    `https://api.geo.admin.ch/rest/services/api/SearchServer?searchText=${encodeURIComponent(
      query
    )}&type=locations&origins=address`
  );
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const data: GeoAdminLocationSearchResponse = await response.json();
  return data.results.map((result) => ({
    label: result.attrs.label.replace(/<[^>]*>/g, ""),
    weight: result.weight,
    lat: result.attrs.lat,
    lon: result.attrs.lon,
  }));
}

export function geoAdminApi() {
  return {
    searchAddressLocation,
  };
}
