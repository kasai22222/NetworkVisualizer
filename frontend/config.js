const env = import.meta.env
const longitude = env.VITE_INITIAL_VIEW_LONGITUDE
const latitude = env.VITE_INITIAL_VIEW_LATITUDE
const zoom = env.VITE_INITIAL_VIEW_ZOOM
const pitch = env.VITE_INITIAL_VIEW_PITCH
function parseEnvInt(value) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
}
// TODO: Add to final readme env var table
export default {
  mapInitialViewState: {
    longitude: parseEnvInt(longitude) ?? 0,
    latitude: parseEnvInt(latitude) ?? 0,
    zoom: parseEnvInt(zoom) ?? 0,
    pitch: parseEnvInt(pitch) ?? 60,
  },
};
